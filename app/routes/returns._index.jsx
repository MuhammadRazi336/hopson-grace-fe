import React, { useState } from 'react';
import {Footer} from '~/components/Footer';
import {Header} from '~/components/Header';
import Heading from '~/components/Heading';
import lineImghead from '/assets/Images/line.png';
import { Button } from '@material-tailwind/react';
import { Check } from 'lucide-react';
import { Upload } from 'lucide-react';

const Returns = () => {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "JANETANDJON@ICLOUD.COM",
        orderNumber: "",
        items: "",
        requestType: "",
        additionalDetails: "",
        agreedToReturn: false,
      })

    const [itemsCharacterCount, setItemsCharacterCount] = useState(0)
    const [detailsCharacterCount, setDetailsCharacterCount] = useState(0)
    const [uploadedFiles, setUploadedFiles] = useState([])

    const handleInputChange = (e) => {
      const { name, value } = e.target
      setFormData((prev) => ({ ...prev, [name]: value }))

      if (name === "items") {
        setItemsCharacterCount(value.length)
      }
      if (name === "additionalDetails") {
        setDetailsCharacterCount(value.length)
      }
    }

    const handleCheckboxChange = (e) => {
      setFormData((prev) => ({ ...prev, agreedToReturn: e.target.checked }))
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

      <div className="w-full h-fit pt-[100px]">
        <Heading
          text="returns & exchanges"
          classes={
            'prata text-4xl lg:text-7xl font-normal text-center max-[1024px]:m-0'
          }
          image={lineImghead}
          imageClasses={'max-[1024px]:max-w-[330px]'}
        />
        <p className="text-1xl lg:text-2xl font-normal text-center py-16 w-[40%] lg:w-[60%]  mx-auto">
          If any of your gifts arrive damaged or defective, we’ll replace them
          and cover the return shipping—at no cost to  you. For all other
          returns, shipping fees will apply.  Items must be returned within 60
          days of receipt.
        </p>

        <div
              className={`bg-steel-blue mb-[200px] mx-auto text-white py-[110px] px-[90px] max-[1601px]:max-w-[60%] pb-28 pt-[130px] relative -left-[37.5px] top-[59px] max-[768px]:max-w-[100%] max-w-[1000px] max-[1024px]:p-6 max-[768px]:-top-[140px] max-[768px]:left-2.5 max-[768px]:pb-20 max-[768px]:pt-14  max-[768px]:w-full`}
            >
              {/* <h3 className="text-3xl text-center max-[768px]:text-2xl afterimg w-full">
                REQUEST A RETURN OR REPLACEMENT
              </h3> */}
              <p className='text-center text-xl afterimg'>
                To request a return or replacement, please complete the form below and our team will get back to you within 2 business days. If your item arrived damaged, you can upload a photo so we can resolve it quickly. We'll also send you a return shipping label.
              </p>
              <div className="mb-10">
              <form className="space-y-6 pt-10" onSubmit={handleSubmit}>
          {/* FULL NAME */}
          <div className="space-y-2">
            <label className="text-white font-semibold">FULL NAME*</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                className="w-full rounded-none p-4 bg-white border-0 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                className="w-full rounded-none p-4 bg-white border-0 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
          </div>

          {/* EMAIL ADDRESS */}
          <div className="space-y-2">
            <label className="text-white font-semibold">EMAIL ADDRESS*</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full rounded-none p-4 bg-white border-0 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>

          {/* ORDER NUMBER */}
          <div className="space-y-2">
            <label className="text-white font-semibold">ORDER NUMBER</label>
            <input
              type="text"
              name="orderNumber"
              placeholder="Include if known; this helps us process your request faster"
              value={formData.orderNumber}
              onChange={handleInputChange}
              className="w-full rounded-none p-4 bg-white border-0 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>

          {/* ITEMS */}
          <div className="space-y-2">
            <label className="text-white font-semibold">ITEMS*</label>
            <textarea
              name="items"
              placeholder="Item(s) you are requesting to return or replace. E.g., 'Large Serving Bowl in Mist'"
              value={formData.items}
              onChange={handleInputChange}
              maxLength={500}
              rows={4}
              className="w-full p-4 bg-white border-0 text-gray-700 placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-white/20"
            />
            <div className="text-white/70 text-sm italic text-left">{itemsCharacterCount}/500 Characters</div>
          </div>

          {/* TYPE OF REQUEST */}
          <div className="space-y-2">
            <label className="text-white font-semibold">TYPE OF REQUEST*</label>
            <select
              name="requestType"
              value={formData.requestType}
              onChange={handleInputChange}
              required
              className="w-full rounded-none p-4 bg-white border-0 text-gray-700 focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              <option value="" className='font-semibold bg-[#FAF9F6]'>Please select from the dropdown</option>
              <option value="damaged-item" className='font-semibold bg-[#F5F2ED]'>DAMAGED OR DEFECTIVE ITEM</option>
              <option value="wrong-item" className='font-semibold bg-[#FAF9F6]'>RECEIVED WRONG ITEM</option>
              <option value="other" className='font-semibold bg-[#F5F2ED]'>OTHER</option>
            </select>
          </div>

          {/* PHOTO UPLOAD */}
          <div className="space-y-2">
            <label className="text-white font-semibold">PHOTO UPLOAD</label>
            <div className="bg-white border-2 border-dashed border-gray-300 p-8 pt-5 mt-2">
            <p className="text-black/70 text-sm">If your item arrived damaged, please upload a photo so we can take care of it quickly.</p>
              <div className="space-y-4 text-center">
                <div className="mx-auto w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mt-3">
                  <Upload className="w-6 h-6 text-black" />
                </div>
                <div>
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    <span className="text-black font-medium">Upload up to 5 photos *</span>
                    <br />
                    <span className="text-black/70 text-sm">(JPEG/PNG max 5MB each)</span>
                  </label>
                  <input
                    id="photo-upload"
                    type="file"
                    multiple
                    accept="image/jpeg,image/png"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
            {uploadedFiles.length > 0 && (
              <div className="text-white/70 text-sm">{uploadedFiles.length} file(s) uploaded</div>
            )}
          </div>

          {/* ADDITIONAL DETAILS */}
          <div className="space-y-2">
            <label className="text-white font-semibold">ADDITIONAL DETAILS</label>
            <textarea
              name="additionalDetails"
              placeholder="E.g., 'The glaze was cracked on arrival'"
              value={formData.additionalDetails}
              onChange={handleInputChange}
              maxLength={500}
              rows={4}
              className="w-full p-4 bg-white border-0 text-gray-700 placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-white/20"
            />
            <div className="text-white/70 text-sm italic text-left">{detailsCharacterCount}/500 Characters</div>
          </div>

          {/* Mandatory field note */}
          <div className="text-white/70 text-sm italic">*Indicates mandatory field.</div>

          {/* Checkbox */}
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 mt-1">
              <div className="relative">
                <input
                  type="checkbox"
                  id="return-agreement"
                  checked={formData.agreedToReturn}
                  onChange={handleCheckboxChange}
                  required
                  className="sr-only rounded-full"
                />
                <label
                  htmlFor="return-agreement"
                  className={`flex items-center justify-center w-5 h-5 border-2 border-white rounded cursor-pointer ${
                    formData.agreedToReturn ? "bg-white" : "bg-transparent"
                  }`}
                >
                  {formData.agreedToReturn && <Check className="w-3 h-3 text-slate-600" />}
                </label>
              </div>
            </div>
            <label htmlFor="return-agreement" className="text-white text-sm italic leading-relaxed cursor-pointer">
              I understand that returns must be requested within 60 days of receiving my item.
            </label>
          </div>

          {/* Submit button */}
          <div className="pt-7 w-full flex justify-center">
            <Button
              type="submit"
              className="w-full mx-auto md:w-auto px-[90px] py-5 rounded-none bg-[#F5F2ED] hover:bg-gray-100 text-black text-xl font-bold tracking-wider uppercase transition-colors"
            >
              REQUEST A RETURN LABEL
            </Button>
          </div>
        </form>
              </div>
              <div className="step absolute bottom-6 max-[768px]:bottom-2.5 right-0 left-0 text-center flex items-center gap-2 justify-center">
              </div>
            </div>

        </div> 

      <Footer />
    </section>
  );
};

export default Returns;
