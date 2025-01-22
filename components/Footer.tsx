import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-gray-100 py-8">
      <div className="container mx-auto px-4 flex justify-center">
        <Image
          src="https://sketch-design.ma/wp-content/uploads/2023/02/logo-black.svg"
          alt="Sketch Design"
          width={140}
          height={42}
        />
      </div>
    </footer>
  )
}

