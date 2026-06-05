import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

console.log("jsPDF:", typeof jsPDF);
console.log("autoTable:", typeof autoTable);

try {
  const doc = new jsPDF("p", "pt", "letter");
  console.log("jsPDF instantiated successfully.");
  autoTable(doc, {
    head: [["A"]],
    body: [["B"]]
  });
  console.log("autoTable called successfully.");
} catch (e) {
  console.error("Error:", e);
}
