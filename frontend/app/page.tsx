export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-6 sm:px-6 sm:py-12">
      <div className="w-full max-w-3xl space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Expense & Subscription Tracker
          </h1>
          <p className="mx-auto max-w-md text-base leading-6 text-muted-foreground sm:text-lg">
            Giderlerinizi ve aboneliklerinizi tek bir yerde takip edin
          </p>
        </div>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <div className="h-11 w-full rounded-lg bg-muted px-4 py-2.5 sm:w-auto">
            <p className="text-sm text-muted-foreground">Başlamak için hazır</p>
          </div>
        </div>
      </div>
    </main>
  );
}
