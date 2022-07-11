import React from 'react';
import { useInitScrollTop } from 'utils/customHooks';
import PageMini from "./PageMini";

const CareerDetailPage = () => {
  useInitScrollTop();

  return (
        <PageMini>
            <div className="CareersDetailPage">
                <div className="content">
                    <header className="title">
                        <span>DevOps Engineer</span>
                        <span>engineering  /  full-time</span>
                    </header>

                    <p className="description">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quisque id diam vel quam elementum pulvinar etiam non quam. Pretium nibh ipsum consequat nisl vel pretium. Enim sed faucibus turpis in eu mi bibendum neque.
                    </p>
                    <p className="description">
                        Augue mauris augue neque gravida in. Dolor sit amet consectetur adipiscing elit duis tristique sollicitudin nibh. Pellentesque habitant morbi tristique senectus et netus. Volutpat maecenas volutpat blandit aliquam etiam erat velit scelerisque in. Orci nulla pellentesque dignissim enim.
                    </p>

                    <p className="description">
                        Platea dictumst quisque sagittis purus sit amet volutpat consequat. Eu nisl nunc mi ipsum. Ut venenatis tellus in metus vulputate eu scelerisque. Ac turpis egestas integer eget aliquet nibh praesent. Netus et malesuada fames ac.
                    </p>

                    <ul className="list">
                        <span>Benefits</span>
                        <li>Dignissim suspendisse in est ante in nibh mauris cursus mattis</li>
                        <li>Scelerisque fermentum dui faucibus in ornare quam viverra orci sagittis.</li>
                        <li>Molestie a iaculis at erat pellentesque adipiscing.</li>
                        <li>Imperdiet sed euismod nisi porta lorem mollis. Sociis natoque penatibus et magnis dis.</li>
                        <li>Sed euismod nisi porta lorem mollis aliquam ut porttitor leo.</li>
                        <li>Tortor id aliquet lectus proin nibh nisl condimentum id venenatis.</li>
                    </ul>

                    <ul className="list">
                        <span>Qualifications</span>
                        <li>Dignissim suspendisse in est ante in nibh mauris cursus mattis</li>
                        <li>Scelerisque fermentum dui faucibus in ornare quam viverra orci sagittis.</li>
                        <li>Molestie a iaculis at erat pellentesque adipiscing.</li>
                        <li>Imperdiet sed euismod nisi porta lorem mollis. Sociis natoque penatibus et magnis dis.</li>
                        <li>Sed euismod nisi porta lorem mollis aliquam ut porttitor leo.</li>
                        <li>Tortor id aliquet lectus proin nibh nisl condimentum id venenatis.</li>
                    </ul>

                    <button className="button-hero">Apply</button>
                </div>
            </div>
        </PageMini>
  );
};

export default CareerDetailPage;
