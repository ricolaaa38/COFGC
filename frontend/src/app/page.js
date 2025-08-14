import Header from "./components/header";
import Footer from "./components/footer";
import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main id={styles.main}>
      <Header />
      <div className={styles.imageContainer}>
        <Image
          src="/vedette.jpg"
          alt="vedette douane"
          fill
          style={{
            objectFit: "cover",
            objectPosition: "50% 20%",
          }}
          priority
        />
      </div>
      <Footer />
    </main>
  );
}
