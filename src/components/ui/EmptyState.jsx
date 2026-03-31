function EmptyState({ message = "No se encontraron resultados" }) {
  return (
    <tr>
      <td colSpan={99} className="text-center py-12 text-gray-400 text-sm">
        {message}
      </td>
    </tr>
  );
}

export default EmptyState;