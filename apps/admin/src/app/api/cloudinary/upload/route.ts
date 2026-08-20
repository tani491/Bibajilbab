import { NextResponse } from "next/server"
import type { UploadApiResponse } from "cloudinary"

import { CloudinaryUnavailableError, parseServerEnv } from "@bibajilbab/config"

import { requireAdminSession } from "@/lib/auth"
import { writeAuditLog } from "@/lib/audit"
import { getCloudinaryServer } from "@/lib/cloudinary/server"
import { validateAdminMediaFile, validateCloudinaryFolderName } from "@/lib/cloudinary/validation"
import { isSameOriginRequest } from "@/lib/csrf"
import { checkRateLimit } from "@/lib/rate-limit"

export const runtime = "nodejs"

interface AdminUploadResult {
  secureUrl: string
  publicId: string
  width?: number | undefined
  height?: number | undefined
  resourceType: string
}

function uploadBuffer({
  buffer,
  folder,
}: {
  buffer: Buffer
  folder: string
}): Promise<UploadApiResponse> {
  const cloudinary = getCloudinaryServer()

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        overwrite: false,
        resource_type: "auto",
        unique_filename: true,
      },
      (error, result) => {
        if (error) {
          reject(error)
          return
        }

        if (!result) {
          reject(new Error("Cloudinary n'a pas retourné de résultat."))
          return
        }

        resolve(result)
      },
    )

    stream.end(buffer)
  })
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Origine de requête refusée." }, { status: 403 })
  }

  const session = await requireAdminSession(["admin", "editor"])
  const rateLimit = checkRateLimit({
    key: `cloudinary-upload:${session.uid}`,
    limit: 20,
    windowMs: 10 * 60 * 1000,
  })

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Trop d'uploads demandés. Réessayez plus tard." },
      { status: 429 },
    )
  }

  try {
    const formData = await request.formData()
    const folderEntry = formData.get("folder")
    const env = parseServerEnv(process.env)
    const folder =
      typeof folderEntry === "string" && folderEntry.trim()
        ? folderEntry.trim()
        : env.cloudinary.uploadFolder
    const files = formData.getAll("files").filter((file): file is File => file instanceof File)

    const folderError = validateCloudinaryFolderName(folder)

    if (folderError) {
      return NextResponse.json({ error: folderError }, { status: 400 })
    }

    if (files.length === 0) {
      return NextResponse.json({ error: "Aucun fichier fourni." }, { status: 400 })
    }

    if (files.length > 10) {
      return NextResponse.json({ error: "Maximum 10 fichiers par upload." }, { status: 400 })
    }

    const validationError = files.map(validateAdminMediaFile).find((error) => error !== null)

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    const uploads: AdminUploadResult[] = []

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer()
      const result = await uploadBuffer({
        buffer: Buffer.from(arrayBuffer),
        folder,
      })

      uploads.push({
        secureUrl: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        resourceType: result.resource_type,
      })
    }

    await writeAuditLog({
      actorUid: session.uid,
      actorEmail: session.email,
      actorRole: session.role,
      action: "cloudinary.upload",
      collection: "media",
      metadata: { folder, files: uploads.length },
    })

    return NextResponse.json({ uploads })
  } catch (error) {
    if (error instanceof CloudinaryUnavailableError) {
      return NextResponse.json(
        { error: "Cloudinary serveur n'est pas configuré." },
        { status: 503 },
      )
    }

    return NextResponse.json({ error: "Upload impossible." }, { status: 500 })
  }
}
