export default function Stepper({ step, totalSteps }) {
  return (
    <div className="flex justify-between mb-4">
      {[...Array(totalSteps)].map((_, index) => (
        <div
          key={index}
          className={`h-1 w-full ${index < step ? 'bg-black' : 'bg-gray-300'}`}
        />
      ))}
    </div>
  );
}
