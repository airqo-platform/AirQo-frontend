import TopBar from 'src/components/nav/TopBar';

const PageMini = ({ children }) => {
  return (
    <div className="Page-mini">
      <TopBar />
      <div className="page-mini-wrapper">{children}</div>
    </div>
  );
};

export default PageMini;
