import styles from "./footer.module.css";

export default function Footer() {
  return (
    <footer id={styles.footer}>
      <h2>FMS COFGC</h2>
      <div>
        <p>Mentions légales</p>
        <p>Politique de confidentialité</p>
      </div>
    </footer>
  );
}
