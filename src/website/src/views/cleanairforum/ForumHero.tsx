import React from 'react';

const ForumHero: React.FC<{ title?: string; subtitle?: string }> = ({
  title = 'Forum Events',
  subtitle = `Explore our collection of Clean Air Forum events bringing together
  communities of practice to foster knowledge sharing and
  cross-border partnerships across Africa`,
}) => {
  return (
    <section className="bg-[#F2F1F6] px-4 lg:px-0 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
            {title}
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
            {subtitle}
          </p>
        </div>
      </div>
    </section>
  );
};

export default ForumHero;
