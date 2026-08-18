import { Container, Skeleton } from "@bibajilbab/ui/server"

export default function SearchLoading() {
  return (
    <main className="py-12">
      <Container>
        <Skeleton className="h-8 w-52" />
        <Skeleton className="mt-4 h-20 w-full max-w-2xl" />
        <Skeleton className="mt-8 h-56 w-full" />
      </Container>
    </main>
  )
}
