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
import { Upload, Check } from 'lucide-react';
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
    setUploadedFiles((prev) => [...prev, ...files].slice(0, 5))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    console.log("Uploaded files:", uploadedFiles)
  }

  return (
    <section>
      <Header />

      <div className="w-full h-[2px] bg-black"></div>

      <div className="w-full h-fit bg-[#FAF9F6] py-[8.177vw]">
        <Heading
          text="submit your wedding"
          classes={
            'prata text-4xl lg:text-[2.5vw] lg:leading-[1.875vw] font-normal text-center max-[1024px]:m-0'
          }
          image={lineImghead}
          imageClasses={'max-[1024px]:max-w-[330px] lg:w-[22.135vw]'}
        />

        <div>
          <div
            className={`flex py-[4.74vw] max-[768px]:py-10 justify-center max-[768px]:flex-col max-[768px]:items-center max-[768px]:px-4 container`}
          >
            <div className="relative left-[37.5px] w-[36.458vw] max-[768px]:max-w-[100%] max-[768px]:left-[initial]">
              <div className="relative">
                <img src={SubmitWeddingImg} alt="" />
                <img
                  src={registrylogoSteps}
                  alt=""
                  className="absolute lg:w-[7.968vw] bottom-4 -left-[72px] max-[768px]:left-[initial] max-[768px]:-right-[7px] max-[768px]:w-[71px] max-[768px]:bottom-0 max-[768px]:top-0 max-[768px]:my-auto"
                />
              </div>
            </div>
            <div
              className={`bg-steel-blue text-white py-[110px] px-[90px] pb-28 pt-[130px] relative -left-[37.5px] top-[59px] max-[768px]:max-w-[100%] w-[52.083vw] max-[1024px]:p-6 max-[768px]:-top-[140px] max-[768px]:left-2.5 max-[768px]:pb-20 max-[768px]:pt-14  max-[768px]:w-full`}
            >
              <h3 className="text-3xl lg:text-[1.25vw] lg:leading-[3.125vw] text-center max-[768px]:text-2xl afterimg w-full">
                WE’D LOVE TO FEATURE YOUR WEDDING
              </h3>
              <p className='text-center pt-5 text-xl lg:text-[1.146vw] lg:leading-[1.667vw]'>
                Whether it’s a single photo for Instagram or a longer story for
                our blog, we love seeing how couples celebrated their wedding.
                Submit your wedding details below — we’ll be in touch if we’d
                like to feature you.
              </p>
              <div className="mb-10">
              <form onSubmit={handleSubmit} className="space-y-6 pt-[3.646vw]">
          {/* Top row - Name and Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                name="coupleName"
                placeholder="Name of Couple*"
                value={formData.coupleName}
                onChange={handleInputChange}
                required
                className="w-full lg:h-[4.271vw] rounded-none p-4 bg-white border-0 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
            <div>
              <input
                type="date"
                name="weddingDate"
                placeholder="Wedding Date*"
                value={formData.weddingDate}
                onChange={handleInputChange}
                required
                className="w-full lg:h-[4.271vw] rounded-none p-4 bg-white border-0 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
          </div>

          {/* Second row - Email and Instagram */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email Address*"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full lg:h-[4.271vw] rounded-none p-4 bg-white border-0 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
            <div>
              <input
                type="text"
                name="instagram"
                placeholder="Instagram Handle (Optional)"
                value={formData.instagram}
                onChange={handleInputChange}
                className="w-full lg:h-[4.271vw] rounded-none p-4 bg-white border-0 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
          </div>

          {/* Large textarea */}
          <div className="space-y-2">
            <textarea
              name="dayDescription"
              placeholder="Tell us a little about your day..."
              value={formData.dayDescription}
              onChange={handleInputChange}
              maxLength={1000}
              rows={8}
              className="w-full lg:h-[15.052vw] p-4 bg-white border-0 text-gray-700 placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-white/20"
            />
            <div className="text-white/70 text-sm italic">{characterCount}/1000 Characters</div>
          </div>

          {/* Photo upload section */}
          <div className="bg-white p-6 space-y-4">
            <p className="text-gray-600 text-sm leading-relaxed">
              Please choose photos that reflect your personal style, showcase your gifts or home, or just capture the
              spirit of your day. Professional photos preferred — but beautifully candid is great, too.
            </p>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mt-2">
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <Upload className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    <span className="text-gray-900 font-medium">Upload up to 5 photos *</span>
                    <br />
                    <span className="text-gray-500 text-sm">(JPEG/PNG max 5MB each)</span>
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
          <div className="text-white/70 text-sm italic">*Indicates mandatory field.</div>

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
                  className={`flex items-center justify-center w-5 h-5 border-2 border-white rounded cursor-pointer ${
                    formData.agreedToShare ? "bg-white" : "bg-transparent"
                  }`}
                >
                  {formData.agreedToShare && <Check className="w-3 h-3 text-slate-600" />}
                </label>
              </div>
            </div>
            <label htmlFor="share-permission" className="text-white ivyora text-[16px] lg:text-[0.833vw] lg:leading-[0.833vw] italic leading-relaxed cursor-pointer">
            I grant The Registry permission to share these images on our website and social media channels, with full credit to the photographer.
            </label>
          </div>

          {/* Submit button */}
          <div className="pt-7 w-full flex justify-center">
            <Button
              type="submit"
              className="w-full mx-auto md:w-auto px-[90px] py-5 rounded-none bg-[#F5F2ED] hover:bg-gray-300 text-black text-xl font-semibold tracking-wider uppercase transition-colors"
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
