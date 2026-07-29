import Button from "../UI/Button";

function CarRowActions({
  car,
  navigate,
  onDelete,
}) {

  const handleFacebook = () => {
    console.log("Facebook Campaign", car);
  };

  const handleTikTok = () => {
    console.log("TikTok Campaign", car);
  };

  const handleAI = () => {
    console.log("AI", car);
  };

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
        onClick={handleAI}
      >
        🤖
      </Button>

      <Button
        onClick={handleFacebook}
      >
        📣
      </Button>

      <Button
        onClick={handleTikTok}
      >
        🎬
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