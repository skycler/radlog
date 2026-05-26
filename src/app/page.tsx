export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <main className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Radlog
        </h1>
        <p className="max-w-md text-lg text-foreground/60">
          A simple, personal ride journal for passionate cyclists.
        </p>
      </main>
    </div>
  )
}
