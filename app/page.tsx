export default function Home() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">TeamAction</h1>
      <p className="mt-2 text-gray-600">Deploy ok! 🎉</p>
      <ul className="mt-6 list-disc pl-6">
        <li><a className="underline" href="/blog">Ir para o Blog</a></li>
        <li><a className="underline" href="/auth/register">Registar</a></li>
      </ul>
    </main>
  );
}
