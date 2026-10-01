import Image from 'next/image';
import Link from 'next/link';

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 group">
      <Image 
        src="/logo.png" 
        alt="TheoCode Academy" 
        width={55} 
        height={55}
        className="group-hover:scale-110 transition-transform"
      />
      <div className="flex flex-col">
        <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          TheoCode Academy
        </span>
      </div>
    </Link>
  );
}