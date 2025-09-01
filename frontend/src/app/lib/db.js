const OAUTH2_URL = process.env.NEXT_PUBLIC_OAUTH2_URL;

class AuthRedirectError extends Error {
  constructor(message) {
    super(message);
    this.name = "AuthRedirectError";
  }
}

function handleAuthFailure() {
  if (typeof window === "undefined") return;
  window._authRedirecting = true;
  const currentFullUrl = window.location.href;
  window.location.href = `${OAUTH2_URL}/oauth2/start?rd=${encodeURIComponent(
    currentFullUrl
  )}`;
}

function isAuthRedirecting(err) {
  if (typeof window !== "undefined" && window._authRedirecting) return true;
  return err && err.name === "AuthRedirectError";
}

export async function apiFetch(input, init = {}) {
  const merged = {
    credentials: "include",
    ...init,
  };
  const resp = await fetch(input, merged);

  if (
    resp.status === 401 ||
    resp.status === 403 ||
    resp.status === 302 ||
    resp.redirected
  ) {
    handleAuthFailure();
    console.log("Redirection to auth server");
    throw new AuthRedirectError();
  }

  return resp;
}

export async function getFiltres() {
  try {
    const response = await apiFetch(`${OAUTH2_URL}/api/filtres/`, {
      method: "GET",
    });
    if (response.ok) {
      return await response.json();
    } else {
      console.error("Erreur lors de la récuperation des filtres");
    }
  } catch (error) {
    if (isAuthRedirecting(error)) return;
    console.error("Erreur lors de la requête des filtres", error);
    return [];
  }
}

export async function addFiltres(filtre) {
  try {
    const response = await fetch(`${OAUTH2_URL}/api/filtres/create`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(filtre),
    });
    if (response.ok) {
      return await response.json();
    } else {
      console.error("Erreur lors de l'ajout du filtre");
    }
  } catch (error) {
    console.error("Erreur lors de la requête d'ajout du filtre", error);
  }
}

export async function updateFiltres(filtre) {
  try {
    const response = await fetch(`${OAUTH2_URL}/api/filtres/update`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(filtre),
    });
    if (response.ok) {
      return await response.json();
    } else {
      console.error("Erreur lors de la mise à jour du filtre");
    }
  } catch (error) {
    console.error("Erreur lors de la requête de mise à jour du filtre", error);
  }
}

export async function deleteFiltres(id) {
  try {
    const response = await fetch(`${OAUTH2_URL}/api/filtres/delete?id=${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (response.ok) {
      return await response.text();
    } else {
      console.error("Erreur lors de la suppression du filtre");
    }
  } catch (error) {
    console.error("Erreur lors de la requête de suppression du filtre", error);
    return "Erreur lors de la suppression du filtre";
  }
}

export async function getBreveById(id) {
  try {
    const response = await apiFetch(`${OAUTH2_URL}/api/breves/id?id=${id}`);
    if (response.ok) {
      return await response.json();
    } else if (response.status === 404) {
      return [];
    } else {
      console.error("Erreur lors de la récupération de la brève");
      return [];
    }
  } catch (error) {
    if (isAuthRedirecting(error)) return;
    console.error("Erreur lors de la requête de la brève", error);
    return [];
  }
}

export async function updateBreveById(id, updatedBreve) {
  try {
    const response = await fetch(`${OAUTH2_URL}/api/breves/update?id=${id}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedBreve),
    });
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.error("Erreur de mise à jour :", response.status);
      return null;
    }
  } catch (error) {
    console.error("Erreur réseau :", error);
    return null;
  }
}

export async function deleteBreveById(id) {
  try {
    const response = await fetch(`${OAUTH2_URL}/api/breves/delete?id=${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (response.ok) {
      return await response.text();
    } else {
      console.error("Erreur lors de la suppression de la brève");
    }
  } catch (error) {
    console.error(
      "Erreur lors de la requête de suppression de la brève",
      error
    );
    return "Erreur lors de la suppression de la brève";
  }
}

export async function getAllBreves(page = 0, size = 10, filters = {}) {
  try {
    const queryParams = new URLSearchParams({
      page,
      size,
      ...Object.fromEntries(
        Object.entries(filters).filter(
          ([_, value]) => value !== undefined && value !== null
        )
      ),
    });
    const response = await apiFetch(
      `${OAUTH2_URL}/api/breves/filtered?${queryParams.toString()}`,
      {
        method: "GET",
      }
    );
    if (response.ok) {
      return await response.json();
    } else {
      console.error("Erreur lors de la récuperation des brèves");
    }
  } catch (error) {
    if (isAuthRedirecting(error)) return;
    console.error("Erreur lors de la requête des brèves", error);
  }
}

export async function getFilteredBrevesForExport(filters = {}) {
  try {
    const queryParams = new URLSearchParams(
      Object.entries(filters).filter(
        ([_, value]) => value !== undefined && value !== null
      )
    );
    const response = await apiFetch(
      `${OAUTH2_URL}/api/breves/export?${queryParams.toString()}`,
      {
        method: "GET",
      }
    );
    if (response.ok) {
      return await response.json();
    } else {
      console.error("Erreur lors de la récupération des brèves pour export");
    }
  } catch (error) {
    if (isAuthRedirecting(error)) return;
    console.error("Erreur lors de la requête des brèves pour export", error);
  }
}

export async function getAllBreveCoords(filters = {}) {
  try {
    const queryParams = new URLSearchParams(
      Object.entries(filters).filter(
        ([_, value]) => value !== undefined && value !== null
      )
    );
    const response = await apiFetch(
      `${OAUTH2_URL}/api/breves/all-coords?${queryParams.toString()}`
    );
    if (response.ok) {
      return await response.json();
    }
    return [];
  } catch (error) {
    if (isAuthRedirecting(error)) return;
    console.error(
      "Erreur lors de la requete des coordonnées des brèves",
      error
    );
  }
}

export async function getBreves() {
  try {
    const response = await apiFetch(`${OAUTH2_URL}/api/breves/`, {
      method: "GET",
    });
    if (response.ok) {
      return await response.json();
    } else {
      console.error("Erreur lors de la récuperation des brèves");
    }
  } catch (error) {
    if (isAuthRedirecting(error)) return;
    console.error("Erreur lors de la requête des brèves", error);
  }
}

export async function getPicturesByBreveId(breveId) {
  try {
    const response = await apiFetch(
      `${OAUTH2_URL}/api/pictures/?breveId=${breveId}`
    );
    if (response.ok) {
      return await response.json();
    } else if (response.status === 404) {
      return [];
    } else {
      console.error("Erreur lors de la récupération des images");
      return [];
    }
  } catch (error) {
    if (isAuthRedirecting(error)) return;
    console.error("Erreur lors de la requête des images", error);
    return [];
  }
}

export async function addPictureForBreve(name, id, file) {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("breveId", id);
  formData.append("imageFile", file);
  try {
    const response = await fetch(`${OAUTH2_URL}/api/pictures/create`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur ${response.status}: ${errorText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur lors de l'envoi de la photo: ", error.message);
    throw error;
  }
}

export async function deletePicture(id) {
  try {
    const response = await fetch(`${OAUTH2_URL}/api/pictures/delete?id=${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }
    return await response.text();
  } catch (error) {
    console.error("Erreur lors de la suppression de l'image :", error.message);
    throw error;
  }
}

export async function getIntervenantsByBreveId(breveId) {
  try {
    const response = await apiFetch(
      `${OAUTH2_URL}/api/intervenants/?breveId=${breveId}`
    );
    if (response.ok) {
      return await response.json();
    } else if (response.status === 404) {
      return [];
    } else {
      console.error("erreur lors de la récupération des intervenants");
      return [];
    }
  } catch (error) {
    if (isAuthRedirecting(error)) return;
    console.error("Erreur lors de la requête", error);
    return [];
  }
}
export async function addIntervenantForBreve(id, name) {
  try {
    const params = new URLSearchParams({ id, name });
    const url = `${OAUTH2_URL}/api/intervenants/create?${params}`;

    const response = await fetch(url, {
      method: "POST",
      credentials: "include",
    });
    if (!response.ok) {
      console.error(
        "Erreur lors de la création de l'intervenant :",
        response.status
      );
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error("Erreur réseau lors de l'ajout de l'intervenant: ", error);
    return null;
  }
}

export async function deleteIntervenant(id) {
  try {
    const response = await fetch(
      `${OAUTH2_URL}/api/intervenants/delete?id=${id}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }
    return await response.text();
  } catch (error) {
    console.error(
      "Erreur lors de la suppression de l'intervenant :",
      error.message
    );
    throw error;
  }
}

export async function getContributeursByBreveId(breveId) {
  try {
    const response = await apiFetch(
      `${OAUTH2_URL}/api/contributeurs/?breveId=${breveId}`
    );
    if (response.ok) {
      return await response.json();
    } else if (response.status === 404) {
      return [];
    } else {
      console.error("erreur lors de la récupération des contributeurs");
      return [];
    }
  } catch (error) {
    if (isAuthRedirecting(error)) return;
    console.error("Erreur lors de la requête", error);
    return [];
  }
}

export async function addContributeurForBreve(id, name) {
  try {
    const params = new URLSearchParams({ id, name });
    const url = `${OAUTH2_URL}/api/contributeurs/create?${params}`;

    const response = await fetch(url, {
      method: "POST",
      credentials: "include",
    });
    if (!response.ok) {
      console.error(
        "Erreur lors de la création du contributeur :",
        response.status
      );
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error("Erreur réseau lors de l'ajout du contributeur: ", error);
    return null;
  }
}

export async function deleteContributeur(id) {
  try {
    const response = await fetch(
      `${OAUTH2_URL}/api/contributeurs/delete?id=${id}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }
    return await response.text();
  } catch (error) {
    console.error(
      "Erreur lors de la suppression du contributeur :",
      error.message
    );
    throw error;
  }
}

export async function addNewBrevesFromFile(file) {
  const formData = new FormData();
  formData.append("file", file);
  try {
    const response = await fetch(`${OAUTH2_URL}/api/breves/upload`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    if (response.ok) {
      const data = await response.text();
      console.log("réponse du serveur :", data);
      return data;
    } else {
      throw new Error(`Http error! Status: ${response.status}`);
    }
  } catch (error) {
    console.error("Erreur lors de l'upload des breves: ", error);
    return `Error uploading breves: ${error.message}`;
  }
}

export async function addNewBreve(breve) {
  try {
    const response = await fetch(`${OAUTH2_URL}/api/breves/create`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(breve),
    });
    if (response.ok) {
      return await response.json();
    } else {
      const errorText = await response.text();
      throw new Error(errorText);
    }
  } catch (error) {
    console.error("Erreur lors de la création de la breve: ", error);
    throw error;
  }
}

export async function addNewDossier(dossier) {
  try {
    const response = await fetch(
      `${OAUTH2_URL}/api/arborescence/create-folder`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dossier),
      }
    );
    if (response.ok) {
      return await response.json();
    } else {
      const errorText = await response.text();
      throw new Error(errorText);
    }
  } catch (error) {
    console.error("Erreur lors de la création du dossier: ", error);
    throw error;
  }
}

export async function updateDossier({ id, parentId, name }) {
  try {
    const response = await fetch(
      `${OAUTH2_URL}/api/arborescence/update-folder?id=${id}&parentId=${parentId}&name=${name}`,
      {
        method: "POST",
        credentials: "include",
      }
    );
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `updateDossier failed (${response.status})`);
    }
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la mise à jour du dossier :", error.message);
    throw error;
  }
}

export async function deleteFolder(id) {
  try {
    const response = await fetch(
      `${OAUTH2_URL}/api/arborescence/delete-folder?id=${id}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }
    return await response.text();
  } catch (error) {
    console.error("Erreur lors de la suppression du dossier :", error.message);
    throw error;
  }
}

export async function addNewFile(parentId, name, file) {
  try {
    const formData = new FormData();
    formData.append("parentId", parentId);
    formData.append("name", name);
    formData.append("file", file);

    const response = await fetch(`${OAUTH2_URL}/api/arborescence/create-file`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la création du fichier :", error.message);
    throw error;
  }
}

export async function updateFile({ id, parentId, name, file }) {
  try {
    const response = await fetch(
      `${OAUTH2_URL}/api/arborescence/update-file?id=${id}&parentId=${parentId}&name=${name}`,
      {
        method: "POST",
        credentials: "include",
      }
    );
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        errorText || `updateFile (json) failed (${response.status})`
      );
    }
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la mise à jour du fichier :", error.message);
    throw error;
  }
}

export async function deleteFile(id) {
  try {
    const response = await fetch(
      `${OAUTH2_URL}/api/arborescence/delete-file?id=${id}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }
    return await response.text();
  } catch (error) {
    console.error("Erreur lors de la suppression du dossier :", error.message);
    throw error;
  }
}

export async function getFolderChildren(parentId) {
  try {
    const response = await apiFetch(
      `${OAUTH2_URL}/api/arborescence/child?parentId=${parentId}`,
      {
        method: "GET",
      }
    );
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    if (isAuthRedirecting(error)) return;
    console.error(
      "Erreur lors de la récupération des enfants :",
      error.message
    );
    throw error;
  }
}

export async function getAllFolders() {
  try {
    const response = await apiFetch(`${OAUTH2_URL}/api/arborescence/dossiers`, {
      method: "GET",
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    if (isAuthRedirecting(error)) return;
    console.error(
      "Erreur lors de la récupération des enfants :",
      error.message
    );
    throw error;
  }
}

export async function getAllFiles() {
  try {
    const response = await apiFetch(`${OAUTH2_URL}/api/arborescence/files`, {
      method: "GET",
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    if (isAuthRedirecting(error)) return;
    console.error(
      "Erreur lors de la récupération des enfants :",
      error.message
    );
    throw error;
  }
}

export async function getAllFilesMeta() {
  try {
    const response = await apiFetch(
      `${OAUTH2_URL}/api/arborescence/files-meta`,
      {
        method: "GET",
      }
    );
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    if (isAuthRedirecting(error)) return;
    console.error(
      "Erreur lors de la récupération des métadonnées des fichiers :",
      error.message
    );
    throw error;
  }
}

export async function getOneFile(fileId) {
  try {
    const response = await apiFetch(
      `${OAUTH2_URL}/api/arborescence/get-file/${fileId}`,
      {
        method: "GET",
      }
    );
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }
    const blob = await response.blob();
    return blob;
  } catch (error) {
    if (isAuthRedirecting(error)) return;
    console.error(
      "Erreur lors de la récupération des enfants :",
      error.message
    );
    throw error;
  }
}

export async function getAllLinksByBreveId(breveId) {
  try {
    const response = await apiFetch(
      `${OAUTH2_URL}/api/links/?breveId=${breveId}`,
      {
        method: "GET",
      }
    );
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    if (isAuthRedirecting(error)) return;
    console.error("Erreur lors de la récupération des liens :", error.message);
    throw error;
  }
}

export async function addLinkForBreve(breveId, link) {
  const newLink = {
    breveId: { id: breveId },
    name: link.name,
    link: link.link,
    typeLink: link.typeLink,
  };
  try {
    const response = await fetch(`${OAUTH2_URL}/api/links/create`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newLink),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de l'ajout du lien :", error.message);
    throw error;
  }
}

export async function deleteLink(id) {
  try {
    const response = await fetch(`${OAUTH2_URL}/api/links/delete?id=${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }
    return await response.text();
  } catch (error) {
    console.error("Erreur lors de la suppression du lien :", error.message);
    throw error;
  }
}

export async function getFileMeta(fileId) {
  const response = await apiFetch(
    `${OAUTH2_URL}/api/arborescence/file-meta/${fileId}`
  );
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return await response.json(); // doit contenir { parentId, ... }
}

export async function getFolderMeta(folderId) {
  const response = await apiFetch(
    `${OAUTH2_URL}/api/arborescence/folder-meta/${folderId}`
  );
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return await response.json(); // doit contenir { parentId, ... }
}

export async function getCommentsByBreveId(breveId) {
  try {
    const response = await apiFetch(
      `${OAUTH2_URL}/api/commentaires/?breveId=${breveId}`
    );
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return await response.json();
  } catch (error) {
    if (isAuthRedirecting(error)) return;
    console.error(
      "Erreur lors de la récupération des commentaires :",
      error.message
    );
    throw error;
  }
}

export async function addCommentForBreve(breveId, comment) {
  const today = new Date().toISOString().slice(0, 10);
  const newComment = {
    breveId: { id: breveId },
    date: today,
    redacteur: comment.redacteur,
    objet: comment.objet,
    commentaire: comment.commentaire,
  };
  try {
    const response = await fetch(`${OAUTH2_URL}/api/commentaires/create`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newComment),
    });
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de l'ajout du commentaire :", error.message);
    throw error;
  }
}

export async function deleteComment(id) {
  try {
    const response = await fetch(
      `${OAUTH2_URL}/api/commentaires/delete?id=${id}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return await response.text();
  } catch (error) {
    console.error(
      "Erreur lors de la suppression du commentaire :",
      error.message
    );
    throw error;
  }
}

export async function getAllIcons() {
  try {
    const response = await apiFetch(`${OAUTH2_URL}/api/icons/`, {
      method: "GET",
    });
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return await response.json();
  } catch (error) {
    if (isAuthRedirecting(error)) return;
    console.error("Erreur lors de la récupération des icônes :", error.message);
    throw error;
  }
}

export async function getIconById(id) {
  try {
    const response = await apiFetch(
      `${OAUTH2_URL}/api/icons/get-one?id=${id}`,
      {
        method: "GET",
      }
    );
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return await response.json();
  } catch (error) {
    if (isAuthRedirecting(error)) return;
    console.error("Erreur lors de la récupération de l'icône :", error.message);
    throw error;
  }
}

export async function addIcon(icon) {
  try {
    const response = await fetch(`${OAUTH2_URL}/api/icons/create`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(icon),
    });
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'icône :", error.message);
    throw error;
  }
}

export async function deleteIcon(id) {
  try {
    const response = await fetch(`${OAUTH2_URL}/api/icons/delete?id=${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return await response.text();
  } catch (error) {
    console.error("Erreur lors de la suppression de l'icône :", error.message);
    throw error;
  }
}

export async function getBreveAssociateIcons(breveId) {
  try {
    const response = await apiFetch(
      `${OAUTH2_URL}/api/icons-by-breve/list?breveId=${breveId}`,
      {
        method: "GET",
      }
    );
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return await response.json();
  } catch (error) {
    if (isAuthRedirecting(error)) return;
    console.error(
      "Erreur lors de la récupération des icônes associées :",
      error.message
    );
    throw error;
  }
}

export async function addBreveIconAssociation({
  breveId,
  iconId,
  intervenantId = null,
  contributeurId = null,
}) {
  const params = new URLSearchParams({
    breveId,
    iconId,
  });
  if (intervenantId) params.append("intervenantId", intervenantId);
  if (contributeurId) params.append("contributeurId", contributeurId);

  try {
    const response = await fetch(
      `${OAUTH2_URL}/api/icons-by-breve/create?${params.toString()}`,
      {
        method: "POST",
        credentials: "include",
      }
    );
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'association :", error.message);
    throw error;
  }
}

export async function deleteBreveIconAssociation(id) {
  try {
    const response = await fetch(
      `${OAUTH2_URL}/api/icons-by-breve/delete?id=${id}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return await response.text();
  } catch (error) {
    console.error(
      "Erreur lors de la suppression de l'association :",
      error.message
    );
    throw error;
  }
}

export async function getViewTrackerByBreveId(breveId) {
  try {
    const response = await apiFetch(
      `${OAUTH2_URL}/api/breveviewtracker/?breveId=${breveId}`,
      {
        method: "GET",
      }
    );
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return await response.json();
  } catch (error) {
    if (isAuthRedirecting(error)) return;
    console.error(
      "Erreur lors de la récupération du view tracker :",
      error.message
    );
    throw error;
  }
}

export async function addAViewTrackerToBreve(breveId, userEmail) {
  try {
    const response = await fetch(
      `${OAUTH2_URL}/api/breveviewtracker/create?breveId=${breveId}&userEmail=${userEmail}`,
      {
        method: "POST",
        credentials: "include",
      }
    );
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de l'ajout du view tracker :", error.message);
    throw error;
  }
}

export async function userHaveAlreadyReadThisBreve(breveId, userEmail) {
  try {
    const response = await apiFetch(
      `${OAUTH2_URL}/api/breveviewtracker/hasViewed?breveId=${breveId}&userEmail=${userEmail}`,
      {
        method: "GET",
      }
    );
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return await response.json();
  } catch (error) {
    if (isAuthRedirecting(error)) return;
    console.error(
      "Erreur lors de la vérification de la lecture de la brève :",
      error.message
    );
    throw error;
  }
}

export async function createApplicationView(userEmail) {
  try {
    const response = await fetch(
      `${OAUTH2_URL}/api/applicationviewtracker/create?userEmail=${userEmail}`,
      {
        method: "POST",
        credentials: "include",
      }
    );
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return await response.json();
  } catch (error) {
    console.error(
      "Erreur lors de la création de la vue d'application :",
      error.message
    );
    throw error;
  }
}

export async function getApplicationViews() {
  try {
    const response = await apiFetch(
      `${OAUTH2_URL}/api/applicationviewtracker/total-connection-per-days`,
      {
        method: "GET",
      }
    );
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return await response.json();
  } catch (error) {
    if (isAuthRedirecting(error)) return;
    console.error(
      "Erreur lors de la récupération des vues d'application :",
      error.message
    );
    throw error;
  }
}

export async function getApplicationViewsByPeriod() {
  try {
    const response = await apiFetch(
      `${OAUTH2_URL}/api/applicationviewtracker/connection-stats`,
      {
        method: "GET",
      }
    );
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return await response.json();
  } catch (error) {
    if (isAuthRedirecting(error)) return;
    console.error(
      "Erreur lors de la récupération des vues d'application par période :",
      error.message
    );
    throw error;
  }
}

export async function getApplicationViewsByWeekDayMonthYear() {
  try {
    const response = await apiFetch(
      `${OAUTH2_URL}/api/applicationviewtracker/connection-per-dayofweek-year`,
      {
        method: "GET",
      }
    );
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return await response.json();
  } catch (error) {
    if (isAuthRedirecting(error)) return;
    console.error(
      "Erreur lors de la récupération des vues d'application par période :",
      error.message
    );
    throw error;
  }
}

export async function createZoneMaritime(zoneDto) {
  try {
    const response = await fetch(`${OAUTH2_URL}/api/zones-maritime/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(zoneDto),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }
    return await response.json();
  } catch (error) {
    console.error(
      "Erreur lors de la création de la zone maritime :",
      error.message
    );
    throw error;
  }
}

export async function getAllZones() {
  try {
    const response = await apiFetch(`${OAUTH2_URL}/api/zones-maritime/`, {
      method: "GET",
    });
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return await response.json();
  } catch (error) {
    if (isAuthRedirecting(error)) return;
    console.error("Erreur lors de la récupération des zones :", error.message);
    throw error;
  }
}

export async function deleteZoneMaritime(id) {
  try {
    const response = await fetch(
      `${OAUTH2_URL}/api/zones-maritime/delete?id=${id}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error(await response.text());
    }
    return await response.text();
  } catch (error) {
    console.error(
      "Erreur lors de la suppression de la zone maritime :",
      error.message
    );
    throw error;
  }
}
