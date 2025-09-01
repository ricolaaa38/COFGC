import Styles from "./popupDeleteBreve.module.css";
import { deleteBreveById } from "../lib/db";
import { useData } from "../context/DataContext";

export default function ConfirmDeleteBrevePopup({
  breveId,
  closeBreveDetails,
  setIsDeleting,
  setOpenPopupDeleteBreve,
}) {
  const { setNeedRefresh } = useData();

  async function confirmedDeleteBreve(breveId) {
    try {
      setIsDeleting(true);
      await deleteBreveById(breveId);
      closeBreveDetails();
      setTimeout(() => {
        setNeedRefresh((s) => !s);
      });
    } catch (error) {
      console.error("Erreur lors de la suppression de la brève :", error);
    }
  }
  console.log(breveId);

  return (
    <div
      className={Styles.overlay}
      //   onClick={() => setOpenPopupDeleteBreve(false)}
      onMouseDown={() => setOpenPopupDeleteBreve(false)}
    >
      <div className={Styles.popup} onMouseDown={(e) => e.stopPropagation()}>
        <div className={Styles.popupHeader}>
          <h3>Supprimer ?</h3>
          <button onClick={() => setOpenPopupDeleteBreve(false)}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <p>Cette action est irréversible !!!</p>
        <button
          className={Styles.confirmedButton}
          onClick={() => confirmedDeleteBreve(breveId)}
        >
          supprimer
        </button>
      </div>
    </div>
  );
}
