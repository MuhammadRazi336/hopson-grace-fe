import React, { useEffect, useRef, useState } from 'react';
import {Footer} from '~/components/Footer';
import {Header} from '~/components/Header';
import Heading from '~/components/Heading';
import lineImghead from '../assets/Images/heading-bottom-curve.png';
import { Button } from '@material-tailwind/react';
import { Check, ChevronDown, Upload } from 'lucide-react';

const REQUEST_TYPE_OPTIONS = [
  { value: 'damaged-item', label: 'DAMAGED OR DEFECTIVE ITEM', itemClass: 'font-semibold bg-[#F5F2ED] p-6 max-[476px]:p-4' },
  { value: 'wrong-item', label: 'RECEIVED WRONG ITEM', itemClass: 'font-semibold bg-[#FAF9F6] p-6 max-[476px]:p-4' },
  { value: 'other', label: 'OTHER', itemClass: 'font-semibold bg-[#F5F2ED] p-6 max-[476px]:p-4' },
];

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

    const fileInputRef = useRef(null)
    const requestTypeRef = useRef(null)
    const [requestTypeOpen, setRequestTypeOpen] = useState(false)
    const [requestTypeError, setRequestTypeError] = useState(false)
    const [isDragActive, setIsDragActive] = useState(false)

    useEffect(() => {
      if (!requestTypeOpen) return undefined
      const onPointerDown = (e) => {
        if (!requestTypeRef.current?.contains(e.target)) setRequestTypeOpen(false)
      }
      document.addEventListener('mousedown', onPointerDown)
      return () => document.removeEventListener('mousedown', onPointerDown)
    }, [requestTypeOpen])

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

    const MAX_UPLOAD_FILES = 5
    const handleAddFiles = (fileList) => {
      const files = Array.from(fileList || [])

      // Only accept images (users may drop non-image files by mistake)
      const imageFiles = files.filter((f) => (f.type || '').startsWith('image/'))

      setUploadedFiles((prev) => [...prev, ...imageFiles].slice(0, MAX_UPLOAD_FILES))
    }

    const handleFileUpload = (e) => {
      handleAddFiles(e.target?.files)
    }

    const handleSubmit = (e) => {
      e.preventDefault()
      if (!formData.requestType) {
        setRequestTypeError(true)
        return
      }
      setRequestTypeError(false)
      console.log("Form submitted:", formData)
      console.log("Uploaded files:", uploadedFiles)
    }

    const selectRequestType = (value) => {
      setFormData((prev) => ({ ...prev, requestType: value }))
      setRequestTypeOpen(false)
      setRequestTypeError(false)
    }

    const requestTypeDisplayLabel =
      formData.requestType === 'damaged-item'
        ? 'DAMAGED OR DEFECTIVE ITEM'
        : formData.requestType === 'wrong-item'
          ? 'RECEIVED WRONG ITEM'
          : formData.requestType === 'other'
            ? 'OTHER'
            : 'Please select from the dropdown'

  return (
    <section>
      <Header />

      <div className="w-full h-fit pt-[5.313vw] max-[476px]:pt-10">
        <Heading
          text="returns & exchanges"
          classes={
            'prata text-4xl mb-0 lg:text-[2.5vw] lg:leading-[3.333vw] font-normal text-center max-[1024px]:m-0'
          }
          image={lineImghead}
          imageClasses={'max-[1024px]:max-w-[330px] lg:w-[21.875vw]'}
        />
        <p className="text-1xl lg:text-[1.25vw] lg:leading-[1.667vw] font-normal text-center pt-[3.073vw] w-[90%] lg:w-[49.01vw]  mx-auto">
          If any of your gifts arrive damaged or defective, we’ll replace them
          and cover the return shipping—at no cost to  you. For all other
          returns, shipping fees will apply.  Items must be returned within 60
          days of receipt.
        </p>

        <div
              className={`bg-steel-blue mb-[200px] mx-auto mt-[5.833vw] text-white px-[8vw] w-[60.104vw] pb-28 py-[4.635vw] relative max-[768px]:max-w-[100%] max-[1024px]:p-6  max-[768px]:pb-20 max-[768px]:pt-14 max-[768px]:w-9/10 max-[768px]:mt-16`}
            >
              {/* <h3 className="text-3xl text-center max-[768px]:text-2xl afterimg w-full">
                REQUEST A RETURN OR REPLACEMENT
              </h3> */}
              <p className='text-center text-xl lg:text-[1.146vw] lg:leading-[1.667vw] afterimg max-[476px]:text-base'>
                To request a return or replacement, please complete the form below and our team will get back to you within 2 business days. If your item arrived damaged, you can upload a photo so we can resolve it quickly. We'll also send you a return shipping label.
                <br/><br/>
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
                className="w-full lg:h-[4.271vw] rounded-none p-4 bg-white border-0 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                className="w-full lg:h-[4.271vw] rounded-none p-4 bg-white border-0 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
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
              className="w-full lg:h-[4.271vw] rounded-none p-4 bg-white border-0 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
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
              className="w-full lg:h-[4.271vw] rounded-none p-4 bg-white border-0 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
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
              className="w-full lg:h-[15.052vw] p-4 bg-white border-0 text-gray-700 placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-white/20"
            />
            <div className="text-white/70 text-sm italic text-left">{itemsCharacterCount}/500 Characters</div>
          </div>

          {/* TYPE OF REQUEST */}
          <div className="space-y-2">
            <label className="text-white font-semibold" id="returns-request-type-label">
              TYPE OF REQUEST*
            </label>
            <div className="relative" ref={requestTypeRef}>
              <button
                type="button"
                id="returns-request-type-trigger"
                aria-haspopup="listbox"
                aria-expanded={requestTypeOpen}
                aria-labelledby="returns-request-type-label returns-request-type-trigger"
                aria-controls="returns-request-type-listbox"
                onClick={() => setRequestTypeOpen((o) => !o)}
                className="w-full lg:h-[4.271vw] rounded-none p-6 bg-white border-0 text-gray-700 focus:outline-none focus:ring-2 focus:ring-white/20 flex items-center justify-between gap-3 text-left"
              >
                <span
                  className={
                    formData.requestType
                      ? 'font-semibold text-gray-700 max-[476px]:text-sm'
                      : 'font-semibold text-gray-500 max-[476px]:text-sm'
                  }
                >
                  {requestTypeDisplayLabel}
                </span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-gray-600 transition-transform ${requestTypeOpen ? 'rotate-180' : ''}`}
                  aria-hidden
                />
              </button>
              {requestTypeOpen && (
                <ul
                  id="returns-request-type-listbox"
                  role="listbox"
                  aria-labelledby="returns-request-type-label"
                  className="absolute z-30 left-0 right-0 top-full mt-0 max-h-[min(50vh,320px)] overflow-y-auto shadow-lg border-0 bg-white"
                >
                  <li role="presentation">
                    <button
                      type="button"
                      role="option"
                      aria-selected={formData.requestType === ''}
                      className="w-full text-left font-semibold bg-[#FAF9F6] p-6 text-gray-700 hover:bg-gray-100 max-[476px]:p-4"
                      onClick={() => selectRequestType('')}
                    >
                      Please select from the dropdown
                    </button>
                  </li>
                  {REQUEST_TYPE_OPTIONS.map((opt) => (
                    <li key={opt.value} role="presentation">
                      <button
                        type="button"
                        role="option"
                        aria-selected={formData.requestType === opt.value}
                        className={`w-full text-left text-gray-700 hover:brightness-95 ${opt.itemClass}`}
                        onClick={() => selectRequestType(opt.value)}
                      >
                        {opt.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {requestTypeError && (
              <p className="text-sm text-red-200" role="alert">
                Please select a request type.
              </p>
            )}
          </div>

          {/* PHOTO UPLOAD */}
          <div className="space-y-2">
            <label className="text-white font-semibold">PHOTO UPLOAD</label>
            <div
              className={`bg-white border-2 border-dashed p-8 pt-5 mt-2 lg:h-[15.573vw] ${
                isDragActive ? 'border-[#446184]' : 'border-gray-300'
              }`}
              onDragEnter={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setIsDragActive(true)
              }}
              onDragOver={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setIsDragActive(true)
              }}
              onDragLeave={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setIsDragActive(false)
              }}
              onDrop={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setIsDragActive(false)
                handleAddFiles(e.dataTransfer?.files)
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  fileInputRef.current?.click()
                }
              }}
              onClick={() => fileInputRef.current?.click()}
            >
            <p className="text-black/70 text-sm">If your item arrived damaged, please upload a photo so we can take care of it quickly.</p>
              <div className="space-y-4 text-center">
                <div className="mx-auto w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mt-3">
                  <Upload className="w-6 h-6 text-black" />
                </div>
                <div>
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    <span className="text-black font-medium">
                      {isDragActive ? 'Drop photos here' : 'Upload up to 5 photos *'}
                    </span>
                    <br />
                    <span className="text-black/70 text-sm">(JPEG/PNG max 5MB each)</span>
                  </label>
                  <input
                    id="photo-upload"
                    ref={fileInputRef}
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
              className="w-full lg:h-[15.052vw] p-4 bg-white border-0 text-gray-700 placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-white/20"
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
            <label htmlFor="return-agreement" className="text-white text-[16px] lg:text-[0.833vw] lg:leading-[0.833vw] italic ivyora font-[400] cursor-pointer">
              I acknowledge that return requests must be made within 60 days of receiving my item.
            </label>
          </div>

          {/* Submit button */}
          <div className="pt-7 w-full flex justify-center">
            <Button
              type="submit"
              className="w-full lg:h-[4.063vw] lg:w-[18.073vw] mx-auto md:w-auto px-[10px] py-5 rounded-none bg-[#F5F2ED] hover:bg-gray-100 text-black text-[18px] leading-[18px] lg:text-[0.938vw] lg:leading-[0.938vw] font-bold tracking-wider uppercase transition-colors"
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
