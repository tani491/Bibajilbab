"use client"

import { useEffect } from "react"

export function UnsavedChangesGuard() {
  useEffect(() => {
    const dirtyForms = new WeakSet<HTMLFormElement>()

    function hasDirtyForm(): boolean {
      return document.querySelector("form[data-guard-unsaved][data-dirty='true']") !== null
    }

    function markDirty(event: Event): void {
      if (!(event.target instanceof Element)) {
        return
      }

      const form = event.target.closest<HTMLFormElement>("form[data-guard-unsaved]")

      if (!form) {
        return
      }

      dirtyForms.add(form)
      form.dataset.dirty = "true"
    }

    function markClean(event: Event): void {
      if (!(event.target instanceof HTMLFormElement)) {
        return
      }

      if (!dirtyForms.has(event.target)) {
        return
      }

      event.target.dataset.dirty = "false"
      dirtyForms.delete(event.target)
    }

    function confirmBeforeLeaving(event: MouseEvent): void {
      if (!hasDirtyForm() || !(event.target instanceof Element)) {
        return
      }

      const link = event.target.closest<HTMLAnchorElement>("a[href]")

      if (!link || link.target === "_blank") {
        return
      }

      if (!window.confirm("Des modifications non enregistrées seront perdues. Continuer ?")) {
        event.preventDefault()
      }
    }

    function beforeUnload(event: BeforeUnloadEvent): void {
      if (!hasDirtyForm()) {
        return
      }

      event.preventDefault()
    }

    document.addEventListener("input", markDirty)
    document.addEventListener("change", markDirty)
    document.addEventListener("submit", markClean, true)
    document.addEventListener("click", confirmBeforeLeaving)
    window.addEventListener("beforeunload", beforeUnload)

    return () => {
      document.removeEventListener("input", markDirty)
      document.removeEventListener("change", markDirty)
      document.removeEventListener("submit", markClean, true)
      document.removeEventListener("click", confirmBeforeLeaving)
      window.removeEventListener("beforeunload", beforeUnload)
    }
  }, [])

  return null
}
