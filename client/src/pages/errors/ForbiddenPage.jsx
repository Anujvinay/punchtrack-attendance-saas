function ForbiddenPage() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-gray-900">
          403
        </h1>

        <p className="mt-2 text-sm text-gray-700">
          You are not authorized to access this page.
        </p>
      </div>
    </main>
  );
}

export default ForbiddenPage;