import React from "react";
import Image from "next/image";

const Nav = () => {
  return (
    <div>
      <div className="flex flex-row justify-between py-2">
        <div className="logo_space flex items-center ml-2 ">
          <Image
            src="/default.png"
            alt="Company Logo"
            width={120}
            height={40}
            className="w-8 h-4"
          />
        </div>
        <div className="lg:flex sm:hidden md:hidden lg:flex-row gap-2">
          <ul className="flex flex-row gap-2 text-black">
            <li className="nav_item">Home</li>
            <li className="nav_item">About</li>
            <li className="nav_item">Services</li>
            <li className="nav_item">Contact</li>

          </ul>
        </div>
      </div>
    </div>
  );
};

export default Nav;
