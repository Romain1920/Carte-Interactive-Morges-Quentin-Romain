import { Button } from "../atoms/button";
import { Textarea } from "../atoms/textarea";

export const getStoredComments = (id) => {
  try {
    return JSON.parse(localStorage.getItem(`comments-${id}`) || "[]");
  } catch {
    return [];
  }
};

const renderCommentsList = (comments = []) => {
  if (!comments.length) return "<li>Aucun commentaire pour l'instant.</li>";
  return comments.map((comment) => `<li>${comment}</li>`).join("");
};

export const CommentsSection = ({ id }) => {
  const comments = getStoredComments(id);
  return `
    <div class="popup-comments">
      <strong style="font-size:13px;">Commentaires</strong>
      <ul>${renderCommentsList(comments)}</ul>
      ${Textarea({ placeholder: "Ajouter un commentaire..." })}
      ${Button({ text: "Publier" })}
    </div>
  `;
};

export const bindCommentsSection = (container, id) => {
  if (!container || !id) return;
  const textarea = container.querySelector(".popup-comments textarea");
  const btn = container.querySelector(".popup-comments button");
  const list = container.querySelector(".popup-comments ul");
  if (!textarea || !btn || !list) return;

  const refreshComments = () => {
    list.innerHTML = renderCommentsList(getStoredComments(id));
  };

  btn.addEventListener("click", () => {
    const value = textarea.value?.trim();
    if (!value) return;
    const comments = getStoredComments(id);
    comments.push(value);
    localStorage.setItem(`comments-${id}`, JSON.stringify(comments));
    textarea.value = "";
    refreshComments();
  });
};
