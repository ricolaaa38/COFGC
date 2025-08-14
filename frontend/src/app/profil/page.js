import Header from "../components/header";
import Footer from "../components/footer";
import styles from "./page.module.css";

export default function Profil() {
  return (
    <div id={styles.profilPage}>
      <Header />
      <h2>Profil page</h2>
      <Footer />
    </div>
  );
}
