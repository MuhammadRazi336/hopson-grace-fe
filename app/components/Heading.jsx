export default function Heading({text, classes, image, imageClasses, divClasses}) {
  return (
    <div className={`flex items-center flex-col gap-2 lg:gap-[0.833vw] ${divClasses || ''}`}>
      <h2 className={`${classes}`}>{text}</h2>
      {image && <img src={image} className={imageClasses} alt="" />}
    </div>
  )
}
