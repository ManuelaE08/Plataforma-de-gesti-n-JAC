function EmptyState({ message = "No se encontraron resultados", inTable = true }) {
  if (inTable) {
    return (
      <tr>
        <td colSpan={99} className="text-center py-12 text-gray-400 text-sm">
          {message}
        </td>
      </tr>
    );
  }

  return (
    <div className="text-center py-12 text-gray-400 text-sm">
      {message}
    </div>
  );
}

export default EmptyState;