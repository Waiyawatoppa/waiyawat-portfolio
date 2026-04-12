// ใส่ async หน้า function
export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  // คลาย Promise ด้วย await
  const { id } = await params;

  return (
    <div className="min-h-screen bg-white p-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Full Page View: {id}</h1>
        <p className="text-gray-600">
          หน้านี้จะปรากฏเมื่อคุณกด Refresh หรือเข้าผ่าน URL ตรง ๆ เท่านั้น
        </p>
      </div>
    </div>
  );
}