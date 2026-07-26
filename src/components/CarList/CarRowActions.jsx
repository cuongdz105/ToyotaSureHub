import Button from "../UI/Button";

function CarRowActions({
  car,
  navigate,
  onDelete,
}) {
  return (
    <>
      <Button
        variant="secondary"
        onClick={() => navigate(`/cars/${car.id}`)}
      >
        👁️
      </Button>

      <Button
        onClick={() => navigate(`/edit/${car.id}`)}
      >
        ✏️
      </Button>

      <Button
        variant="danger"
        onClick={() => onDelete(car.id)}
      >
        🗑️
      </Button>
    </>
  );
}

export default CarRowActions;