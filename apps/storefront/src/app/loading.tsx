import { Container, Skeleton } from "@bibajilbab/ui/server"

export default function StorefrontLoading() {
  return (
    <main className="py-12">
      <Container>
        <Skeleton className="h-9 w-64" />
        <Skeleton className="mt-5 h-24 w-full max-w-2xl" />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="aspect-[4/5]" />
          ))}
        </div>
      </Container>
    </main>
  )
}
