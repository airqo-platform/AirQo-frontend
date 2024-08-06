import React from 'react';
import { FaRegFilePdf } from 'react-icons/fa';
import { BsFiletypePpt, BsFiletypePptx } from 'react-icons/bs';
import { FaRegFileWord } from 'react-icons/fa';

const Resources = ({ Resources }) => {
  console.log(Resources);

  const getFileIcon = (fileName) => {
    const fileExtension = fileName.split('.').pop().toLowerCase();
    switch (fileExtension) {
      case 'pdf':
        return <FaRegFilePdf color="#ff0000" />;
      case 'ppt':
      case 'pptx':
        return <BsFiletypePpt color="#ff9900" />;
      case 'doc':
      case 'docx':
        return <FaRegFileWord color="#0000ff" />;
      default:
        return null;
    }
  };

  const getFileNameFromUrl = (url) => {
    const urlParts = url.split('?')[0].split('/');
    return urlParts[urlParts.length - 1];
  };

  if (Resources.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '20vh'
        }}>
        <h2>No resources available</h2>
      </div>
    );
  }

  return Resources.map((resource, index) => (
    <div className="resources" key={resource.id}>
      <h2>{resource.resource_title}</h2>
      {resource.resource_files.map((file, fileIndex) => (
        <React.Fragment key={file.id}>
          <ul>
            <li>
              <div dangerouslySetInnerHTML={{ __html: file.resource_summary_html }} />
              <a
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  textDecoration: 'none',
                  color: '#0000ffc7'
                }}
                href={file.file}
                target="_blank"
                rel="noreferrer"
                download>
                {getFileIcon(file.file)}
                <span style={{ marginLeft: '10px' }}>{getFileNameFromUrl(file.file)}</span>
              </a>
            </li>
          </ul>
        </React.Fragment>
      ))}
      {index < Resources.length - 1 && <hr />}
    </div>
  ));
};

export default Resources;
