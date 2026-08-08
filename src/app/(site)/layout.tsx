import { getCategories } from "@/lib/queries";
import Header from "@/components/site/header";
import Footer from "@/components/site/footer";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCategories();

  return (
    <>
      <Header categories={categories} />
      {children}
      <Footer categories={categories} />
    </>
  );
}
