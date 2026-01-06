import {Header} from '~/components/Header';
import {CoupleProfileViewHeader} from '~/routes/couple.test._index';
import {Footer} from '~/components/Footer';
import {useState} from 'react';
import teaImg from '/assets/Images/reading-image.png';
import NotificationCard from '~/components/NotificationCard';
// import giftIcon from '/assets/Images/gift-icon.png';

export default function DashboardHome() {
  const [editForm, setEditForm] = useState(false);

  return (
    <div className="container mx-auto pt-[80px]">
      <CoupleProfileViewHeader />

      <div className="flex xl:flex-nowrap flex-wrap gap-4 flex-shrink-0 pb-16">
        <div className="w-full xl:w-9/12 flex flex-col gap-y-4 items-center pb-8">
          <h2 className="mt-0 ivyora lg:text-3xl xl:text-4xl 2xl:text-[48px] text-[24px] prata text-center lg:leading-[60px] font-normal mb-1">
            <span className=" prata uppercase">My registry</span> details
          </h2>
          <img
            src="/assets/Images/profile-view-page-bdr.png"
            alt="Couple"
            className="max-w-[630px] h-auto mx-auto"
          />

          <div className="bg-[#446184] max-w-4xl mx-12 text-white w-full min-h-[500px]">
            {editForm ? <EditForm /> : <ViewForm />}
          </div>

          <div className="flex max-w-4xl w-full justify-end">
          {editForm ? (
            <button
              onClick={() => setEditForm(false)}
              className="uppercase text-[#223247] border border-[#223247 ] cursor-pointer font-bold text-lg mt-5 px-12 py-2"
            >
              Save 
            </button>
          ) : (
            <button
              onClick={() => setEditForm(true)}
              className="uppercase text-[#223247] border-b border-[#223247 ] cursor-pointer font-bold text-lg   mt-5 block"
            >
              Edit my info
            </button>
          )}
          </div>
        </div>
        <div className="w-full xl:w-3/12 flex flex-col gap-y-4">
          <div>
            <NotificationCard />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function EditForm() {
  return (
    <form className="grid grid-cols-2 gap-4 p-8 bg-[#375a7f] text-white">
    {/* You and Wedding Date */}
    <div>
      <label className="block font-medium mb-1 text-base" htmlFor="you">
        YOU*
      </label>
      <input
        type="text"
        id="you"
        name="you"
        defaultValue="HANNAH SMITH"
        className="outline-none text-black w-full border border-gray-300 bg-white rounded-none px-4 py-4"
      />
    </div>
    <div>
      <label className="block font-medium mb-1 text-base" htmlFor="weddingDate">
        WEDDING DATE*
      </label>
      <input
        type="date"
        id="weddingDate"
        name="weddingDate"
        placeholder="MM/DD/YYYY"
        className="outline-none text-black w-full border border-gray-300 bg-white rounded-none px-4 py-4"
      />
    </div>

    {/* Fiancé and Venue */}
    <div>
      <label className="block font-medium mb-1 text-base" htmlFor="fiance">
        YOUR FIANCE
      </label>
      <input
        type="text"
        id="fiance"
        name="fiance"
        defaultValue="MAX RICHARDS"
        className="outline-none text-black w-full border border-gray-300 bg-white rounded-none px-4 py-4"
      />
    </div>
    <div>
      <label className="block font-medium mb-1 text-base" htmlFor="venue">
        WEDDING VENUE
      </label>
      <input
        type="text"
        id="venue"
        name="venue"
        defaultValue="THE DRAKE HOTEL"
        className="outline-none text-black w-full border border-gray-300 bg-white rounded-none px-4 py-4"
      />
    </div>

    {/* Email and Location/Guests */}
    <div>
      <label className="block font-medium mb-1 text-base" htmlFor="email">
        YOUR EMAIL*
      </label>
      <input
        type="email"
        id="email"
        name="email"
        defaultValue="MAX&HANNAH@GMAIL.COM"
        className="outline-none text-black w-full border border-gray-300 bg-white rounded-none px-4 py-4"
      />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block font-medium mb-1 text-base" htmlFor="location">
          WEDDING LOCATION
        </label>
        <input
          type="text"
          id="location"
          name="location"
          defaultValue="TORONTO"
          className="outline-none text-black w-full border border-gray-300 bg-white rounded-none px-4 py-4"
        />
      </div>
      <div>
        <label className="block font-medium mb-1 text-base" htmlFor="guests">
          NO. OF GUESTS
        </label>
        <input
          type="number"
          id="guests"
          name="guests"
          defaultValue={125}
          className="outline-none text-black w-full border border-gray-300 bg-white rounded-none px-4 py-4"
        />
      </div>
    </div>

    {/* Password and Hashtag */}
    <div>
      <label className="block font-medium mb-1 text-base" htmlFor="password">
        YOUR PASSWORD*
      </label>
      <input
        type="password"
        id="password"
        name="password"
        defaultValue="************"
        className="outline-none text-black w-full border border-gray-300 bg-white rounded-none px-4 py-4"
      />
      <button type="button" className="text-xs underline mt-1 text-white">
        Reset Password
      </button>
    </div>
    <div>
      <label className="block font-medium mb-1 text-base" htmlFor="hashtag">
        WEDDING HASHTAG
      </label>
      <input
        type="text"
        id="hashtag"
        name="hashtag"
        placeholder="Enter Wedding Hashtag"
        className="outline-none text-black w-full border border-gray-300 bg-white rounded-none px-4 py-4"
      />
    </div>

    

    {/* Shipping Address */}
    <div className="col-span-2 font-medium mb-2 mt-10">YOUR SHIPPING ADDRESS</div>
    <div>
      <input
        type="text"
        placeholder="Address*"
        className="outline-none text-black w-full border border-gray-300 bg-white rounded-none px-4 py-4"
      />
    </div>
    <div>
      <input
        type="text"
        placeholder="City*"
        className="outline-none text-black w-full border border-gray-300 bg-white rounded-none px-4 py-4"
      />
    </div>
    <div>
      <input
        type="text"
        placeholder="Province/State*"
        className="outline-none text-black w-full border border-gray-300 bg-white rounded-none px-4 py-4"
      />
    </div>
    <div>
      <input
        type="text"
        placeholder="Country*"
        className="outline-none text-black w-full border border-gray-300 bg-white rounded-none px-4 py-4"
      />
    </div>
  </form>
  );
}

function ViewForm() {
  return (
    <div className="grid grid-cols-2">
      <div className="p-8 flex flex-col gap-6">
        <div>
          <div className="text-xs tracking-widest mb-1">YOU</div>
          <div className="text-lg ">HANNAH SMITH</div>
        </div>
        <div>
          <div className="text-xs tracking-widest mb-1">YOUR FIANCÉ</div>
          <div className="text-lg ">MAX RICHARDS</div>
        </div>
        <div>
          <div className="text-xs tracking-widest mb-1">YOUR EMAIL</div>
          <div className="text-lg ">H****@*****.COM</div>
        </div>
        <div>
          <div className="text-xs tracking-widest mb-1">YOUR PASSWORD</div>
          <div className="text-lg ">***************</div>
        </div>
        <div>
          <div className="text-xs tracking-widest mb-1">
            YOUR SHIPPING ADDRESS
          </div>
          <div className="text-lg  whitespace-pre-line">
            123 YONGE STREET\nTORONTO, ONTARIO\nM5R 1W5\nCANADA
          </div>
        </div>
      </div>
      <div className="p-8 flex flex-col gap-6">
        <div>
          <div className="text-xs tracking-widest mb-1">WEDDING DATE</div>
          <div className="text-lg ">MAY 29, 2026</div>
        </div>
        <div>
          <div className="text-xs tracking-widest mb-1">WEDDING VENUE</div>
          <div className="text-lg ">THE DRAKE HOTEL</div>
        </div>
        <div className="flex flex-row gap-x-4">
          <div>
            <div className="text-xs tracking-widest mb-1">WEDDING LOCATION</div>
            <div className="text-lg ">TORONTO</div>
          </div>
          <div>
            <div className="text-xs tracking-widest mb-1">NO. OF GUESTS</div>
            <div className="text-lg ">125</div>
          </div>
        </div>

        <div>
          <div className="text-xs tracking-widest mb-1">WEDDING HASHTAG</div>
          <div className="text-lg ">-</div>
        </div>
      </div>
    </div>
  );
}
