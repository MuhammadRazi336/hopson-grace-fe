export default function Heading({text, classes, image}) {
  return (
    <div className="flex items-center flex-col gap-4">
      <h2 className={`mb-4 ${classes}`}>{text}</h2>
      {image && <img src={image} alt="" />}
    </div>
  )
}
