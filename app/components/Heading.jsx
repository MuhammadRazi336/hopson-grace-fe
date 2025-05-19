export default function Heading({text, classes, image, imageClasses}) {
  return (
    <div className="flex items-center flex-col gap-2 lg:gap-4">
      <h2 className={`${classes}`}>{text}</h2>
      {image && <img src={image} className={imageClasses} alt="" />}
    </div>
  )
}
