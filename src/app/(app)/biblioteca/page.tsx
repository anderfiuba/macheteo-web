import { BibliotecaLista } from "@/components/biblioteca/BibliotecaLista";

export const metadata = { title: "Biblioteca · Macheteo" };

export default function Page() {
  return (
    <>
      <h1 className="mb-6 text-[28px] leading-[34px] lg:text-[36px] lg:leading-[42px]">Biblioteca</h1>
      <BibliotecaLista />
    </>
  );
}
