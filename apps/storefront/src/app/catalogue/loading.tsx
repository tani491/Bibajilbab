import { Container, Skeleton } from "@bibajilbab/ui/server"

export default function CatalogueLoading() {
  return (
    <main className="py-12">
      <Container>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-4 h-20 w-full max-w-2xl" />
        <Skeleton className="mt-8 h-56 w-full" />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <Skeleton key={index} className="aspect-[4/5] w-full" />
          ))}
        </div>
      </Container>
    </main>
  )
}
