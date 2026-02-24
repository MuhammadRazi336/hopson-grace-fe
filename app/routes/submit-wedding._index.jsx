import React, { useState } from 'react';
import {Footer} from '~/components/Footer';
import {Header} from '~/components/Header';
import Heading from '~/components/Heading';
import lineImghead from '/assets/Images/line.png';
import SubmitWeddingImg from '/assets/Images/SubmitWedding.png';
import {Link} from '@remix-run/react';
import registrylogoSteps from '/assets/Images/registrylogoSteps.png';
import StepLine from '/assets/Images/StepLine.png';
import { Button } from '@material-tailwind/react';
import { Upload, Check, ArrowUp } from 'lucide-react';
import ButtonComponent from '~/components/Button';

const SubmitWedding = () => {
    const [formData, setFormData] = useState({
        coupleName: "",
        weddingDate: "",
        email: "",
        instagram: "",
        dayDescription: "",
        agreedToShare: false,
      })

      const [characterCount, setCharacterCount] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [isDragging, setIsDragging] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (name === "dayDescription") {
      setCharacterCount(value.length)
    }
  }

  const handleCheckboxChange = (e) => {
    setFormData((prev) => ({ ...prev, agreedToShare: e.target.checked }))
  }

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || [])
    setUploadedFiles((prev) => [...prev, ...files].slice(0, 10))
  }

  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files || [])
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    setUploadedFiles((prev) => [...prev, ...imageFiles].slice(0, 10))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    console.log("Uploaded files:", uploadedFiles)
  }

  return (
    <section>
      <Header />

      <div className="w-full h-fit bg-[#FAF9F6] pt-[8.177vw] pb-[9.531vw] max-[1024px]:pb-[150px] max-[1024px]:pt-[50px] max-[767px]:pb-0">
        <Heading
          text="submit your wedding"
          classes={
            'prata text-2xl lg:text-[2.5vw] xl:text-[2.5vw] 2xl:text-[2.5vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] font-normal text-center max-[1024px]:m-0'
          }
          image={lineImghead}
          imageClasses={'max-[1024px]:max-w-[330px] lg:w-[22.135vw] xl:w-[22.135vw] 2xl:w-[22.135vw]'}
        />

        <div>
          <div
            className={`flex pt-[4.74vw] max-[768px]:py-10 justify-center max-[768px]:flex-col max-[768px]:items-center max-[768px]:px-4`}
          >
            <div className="relative left-[37.5px] w-[36.458vw] max-[768px]:max-w-[100%] max-[768px]:left-[initial]">
              <div className="relative">
                <img src={SubmitWeddingImg} alt="" />
                <img
                  src={registrylogoSteps}
                  alt=""
                  className="absolute lg:w-[7.968vw] bottom-4 -left-[72px] max-[768px]:left-[initial] max-[768px]:-right-[7px] max-[768px]:w-[71px] max-[768px]:bottom-0 max-[768px]:top-0 max-[768px]:my-auto max-[1024px]:hidden"
                />
              </div>
            </div>
            <div
              className={`bg-steel-blue text-white p-[5.365vw] relative -left-[37.5px] top-[59px] max-[768px]:max-w-[100%] w-[52.083vw] max-[1024px]:p-6 max-[768px]:-top-[140px] max-[768px]:left-2.5 max-[768px]:pb-20 max-[768px]:pt-14 max-[768px]:w-full max-[1024px]:p-[40px]`}
            >
              <h3 className="text-xl lg:text-[1.25vw] xl:text-[1.25vw] 2xl:text-[1.25vw] lg:leading-[3.125vw] xl:leading-[3.125vw] 2xl:leading-[3.125vw] text-center max-[768px]:text-xl afterimg w-full">
                WE’D LOVE TO FEATURE YOUR WEDDING
              </h3>
              <p className='text-center pt-5 text-[16px] lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] lg:leading-[1.667vw] xl:leading-[1.667vw] 2xl:leading-[1.667vw]'>
                Whether it’s a single photo for Instagram or a longer story for
                our blog, we love seeing how couples celebrated their wedding.
                Submit your wedding details below — we’ll be in touch if we’d
                like to feature you.
              </p>
              <div className="mb-10">
              <form onSubmit={handleSubmit} className="space-y-6 pt-[3.646vw]">
          {/* Top row - Your First and Last Name */}
          <div className="grid grid-cols-1 mb-[1.51vw] md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4 lg:gap-[1.146vw] xl:gap-[1.146vw] 2xl:gap-[1.146vw]">
            <div>
              <input
                type="text"
                name="coupleFirstName"
                placeholder="Your First Name*"
                value={formData.coupleFirstName}
                onChange={handleInputChange}
                required
                className="w-full lg:h-[4.271vw] rounded-none p-4 m-0 bg-white border-0 text-gray-700 placeholder-[#948E8A] focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
            <div>
              <input
                type="text"
                name="coupleLastName"
                placeholder="Your Last Name*"
                value={formData.coupleLastName}
                onChange={handleInputChange}
                required
                className="w-full lg:h-[4.271vw] rounded-none p-4 m-0 bg-white border-0 text-gray-700 placeholder-[#948E8A] focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
          </div>

          {/* Second row - Partner's First and Last Name */}
          <div className="grid mb-[1.51vw] grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                name="partnerFirstName"
                placeholder="Your Partner’s First Name*"
                value={formData.partnerFirstName}
                onChange={handleInputChange}
                required
                className="w-full lg:h-[4.271vw] rounded-none p-4 m-0 bg-white border-0 text-gray-700 placeholder-[#948E8A] focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
            <div>
              <input
                type="text"
                name="partnerLastName"
                placeholder="Your Partner’s Last Name*"
                value={formData.partnerLastName}
                onChange={handleInputChange}
                required
                className="w-full lg:h-[4.271vw] rounded-none p-4 m-0 bg-white border-0 text-gray-700 placeholder-[#948E8A] focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
          </div>

          {/* Third row - Wedding Date and Email */}
          <div className="grid mb-[1.51vw] grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="date"
                name="weddingDate"
                placeholder="Wedding Date*"
                value={formData.weddingDate}
                onChange={handleInputChange}
                required
                className="w-full lg:h-[4.271vw] rounded-none p-4 m-0 bg-white border-0 text-gray-700 placeholder-[#948E8A] focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
            <div>
              <input
                  type="email"
                  name="email"
                  placeholder="Email Address*"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full lg:h-[4.271vw] rounded-none p-4 m-0 bg-white border-0 text-gray-700 placeholder-[#948E8A] focus:outline-none focus:ring-2 focus:ring-white/20"
                />
            </div>
          </div>

          {/* Fourth row - Photographer and Wedding Planner */}
          <div className="grid mb-[1.51vw] grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                name="photographer"
                placeholder="Photographer"
                value={formData.photographer}
                onChange={handleInputChange}
                required
                className="w-full lg:h-[4.271vw] rounded-none p-4 m-0 bg-white border-0 text-gray-700 placeholder-[#948E8A] focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
            <div>
              <input
                type="text"
                name="weddingPlanner"
                placeholder="Wedding Planner"
                value={formData.weddingPlanner}
                onChange={handleInputChange}
                required
                className="w-full lg:h-[4.271vw] rounded-none p-4 m-0 bg-white border-0 text-gray-700 placeholder-[#948E8A] focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
          </div>

          {/* Instagram Handle */}
          <div className="space-y-2 mb-[1.51vw]">
            <input
                type="text"
                name="instagram"
                placeholder="Instagram Handle (Optional)"
                value={formData.instagram}
                onChange={handleInputChange}
                className="w-full lg:h-[4.271vw] rounded-none p-4 m-0 bg-white border-0 text-gray-700 placeholder-[#948E8A] focus:outline-none focus:ring-2 focus:ring-white/20"
              />
          </div>

          {/* Large textarea */}
          <div className="space-y-2 mb-[1.51vw]">
            <textarea
              name="dayDescription"
              placeholder="Tell us where you were married and any other details you’d like to share...*"
              value={formData.dayDescription}
              onChange={handleInputChange}
              maxLength={200}
              rows={8}
              required
              className="w-full lg:h-[10.26vw] xl:h-[10.26vw] 2xl:h-[10.26vw] p-4 bg-white border-0 text-gray-700 placeholder-[#948E8A] resize-none focus:outline-none focus:ring-2 focus:ring-white/20"
            />
            <div className="text-white/70 text-sm italic mb-[1.51vw] ivyora lg:text-[0.833vw] xl:text-[0.833vw] 2xl:text-[0.833vw]">{characterCount}/200 Characters</div>
          </div>

          {/* Photo upload section */}
          <div className="bg-white p-6 space-y-4 mb-[0.8vw]">
            <p className="text-[#948E8A] text-sm lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] leading-relaxed">
            Please choose photos that reflect your personal style, showcase your gifts or home, or just capture the spirit of your day. Professional photos preferred — but beautifully candid is great, too.
            </p>

            <div 
              className={`pt-2 px-1 text-center mt-2 transition-all duration-200 border-2 border-dashed rounded-lg py-8 ${
                isDragging 
                  ? 'border-[#141B34] bg-[#141B34]/5 scale-[1.02]' 
                  : 'border-transparent hover:border-gray-300'
              }`}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="space-y-4">
                <div className={`mx-auto w-12 h-12 border-[1.5px] border-[#141B34] rounded-full flex items-center justify-center transition-all duration-200 ${
                  isDragging ? 'border-[2px] bg-[#141B34]/5' : ''
                }`}>
                  <ArrowUp className={`w-6 h-6 text-[#141B34] transition-all duration-200 ${
                    isDragging ? 'scale-110' : ''
                  }`} />
                </div>
                <div>
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    <span className="text-[#1F1D1B] lg:text-[1.042vw] xl:text-[1.042vw] 2xl:text-[1.042vw]">
                      {isDragging ? 'Drop photos here' : 'Upload a minimum of 5 and up to 10 photos *'}
                    </span>
                    <br />
                    <span className="text-[#1F1D1B] text-sm lg:text-[1.042vw] xl:text-[1.042vw] 2xl:text-[1.042vw]">
                      {isDragging ? '' : '(JPEG/PNG max 5MB each) or drag and drop'}
                    </span>
                  </label>
                  <input
                    id="photo-upload"
                    type="file"
                    multiple
                    accept="image/jpeg,image/png"
                    onChange={handleFileUpload}
                    className="hidden"
                    required
                  />
                </div>
              </div>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="text-sm text-gray-600">{uploadedFiles.length} file(s) uploaded</div>
            )}
          </div>

          {/* Mandatory field note */}
          <div className="text-white/70 text-sm italic mb-[1.51vw] ivyora lg:text-[0.833vw] xl:text-[0.833vw] 2xl:text-[0.833vw]">*Indicates mandatory field.</div>

          {/* Checkbox */}
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 mt-1">
              <div className="relative">
                <input
                  type="checkbox"
                  id="share-permission"
                  checked={formData.agreedToShare}
                  onChange={handleCheckboxChange}
                  required
                  className="sr-only rounded-full"
                />
                <label
                  htmlFor="share-permission"
                  className={`flex items-center justify-center w-[2.344vw] h-[2.344vw] border-2 border-white rounded-full cursor-pointer ${
                    formData.agreedToShare ? "bg-white" : "bg-transparent"
                  }`}
                >
                  {formData.agreedToShare && <Check className="w-[1.406vw] h-[1.406vw] text-slate-600" />}
                </label>
              </div>
            </div>
            <label htmlFor="share-permission" className="text-white ivyora text-[16px] lg:text-[0.833vw] lg:leading-[0.833vw] italic leading-relaxed lg:leading-[0.938vw] xl:leading-[0.938vw] 2xl:leading-[0.938vw] cursor-pointer">
              I give The Registry permission to share these images on social media and the website, with proper credit to the photographer.
            </label>
          </div>

          {/* Submit button */}
          <div className="pt-7 w-full flex justify-center">
            <Button
              type="submit"
              className="w-full lg:w-[18.073vw] xl:w-[18.073vw] 2xl:w-[18.073vw] mx-auto py-5 rounded-none bg-[#F5F2ED] hover:bg-gray-300 text-black text-xl lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] font-bold cursor-pointer tracking-wider uppercase transition-colors bastardogrotesk"
            >
              SUBMIT
            </Button>
          </div>
        </form>
              </div>
              <div className="step absolute bottom-6 max-[768px]:bottom-2.5 right-0 left-0 text-center flex items-center gap-2 justify-center">
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </section>
  );
};

export default SubmitWedding;
