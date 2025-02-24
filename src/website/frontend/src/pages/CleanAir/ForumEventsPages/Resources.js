import React, { useState } from 'react';
import DOMPurify from 'dompurify';
import { FaRegFilePdf, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { BsFiletypePpt } from 'react-icons/bs';
import { FaRegFileWord } from 'react-icons/fa';
import SEO from 'utilities/seo';

const Resources = ({ Resources }) => {
  const [collapsedSessions, setCollapsedSessions] = useState(
    Resources.reduce((acc, resource) => {
      resource.resource_sessions.forEach((session) => {
        acc[session.id] = false; // Not collapsed by default
      });
      return acc;
    }, {})
  );

  const toggleSession = (sessionId) => {
    setCollapsedSessions((prevState) => ({
      ...prevState,
      [sessionId]: !prevState[sessionId]
    }));
  };

  const toggleAllSessions = (collapse) => {
    const newCollapsedState = Resources.reduce((acc, resource) => {
      resource.resource_sessions.forEach((session) => {
        acc[session.id] = collapse;
      });
      return acc;
    }, {});
    setCollapsedSessions(newCollapsedState);
  };

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

  return (
    <div>
      <SEO
        title="CLEAN-Air Forum Resources"
        siteTitle="AirQo Africa"
        description="Access a wealth of resources on air quality management in Africa, curated by the CLEAN-Air Forum. Find research papers, policy briefs, and practical guides to support clean air initiatives in urban environments."
        canonicalUrl="https://airqo.africa/clean-air/forum#resources"
        article={false}
        keywords="air quality resources, environmental research, African urban health studies, clean air policy documents"
      />
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          padding: '10px'
        }}>
        <button
          onClick={() => toggleAllSessions(false)}
          style={{
            padding: '5px',
            marginRight: '10px',
            backgroundColor: '#0f4acc',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px'
          }}>
          Expand All
        </button>
        <button
          onClick={() => toggleAllSessions(true)}
          style={{
            padding: '5px',
            backgroundColor: '#6c757d',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px'
          }}>
          Collapse All
        </button>
      </div>
      {Resources.map((resource, index) => (
        <div className="resources" key={resource.id}>
          <h3
            style={{
              paddingTop: '20px'
            }}>
            {resource.resource_title}
          </h3>
          {resource.resource_sessions.map((session) => (
            <ol key={session.id}>
              <h4
                style={{
                  cursor: 'pointer',
                  color: '#0f4acc',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
                onClick={() => toggleSession(session.id)}>
                {session.session_title}
                {collapsedSessions[session.id] ? (
                  <FaChevronDown size={15} />
                ) : (
                  <FaChevronUp size={15} />
                )}
              </h4>
              {!collapsedSessions[session.id] && (
                <div>
                  {session.resource_files.map((file, fileIndex) => (
                    <React.Fragment key={fileIndex}>
                      <ul>
                        <li
                          key={fileIndex}
                          style={{
                            lineHeight: '1.5'
                          }}>
                          <p
                            style={{
                              padding: '0',
                              margin: '10px 0',
                              fontSize: '14px',
                              lineHeight: '1.5'
                            }}>
                            {file.resource_summary}
                          </p>
                          <a
                            style={{
                              fontSize: '14px',
                              display: 'flex',
                              alignItems: 'center',
                              textDecoration: 'none',
                              color: '#0000ffc7'
                            }}
                            href={file.file}
                            target="_blank"
                            rel="noreferrer"
                            download>
                            {getFileIcon(getFileNameFromUrl(file.file))}
                            <span style={{ marginLeft: '10px' }}>
                              {getFileNameFromUrl(file.file)}
                            </span>
                          </a>
                        </li>
                      </ul>
                    </React.Fragment>
                  ))}
                </div>
              )}
            </ol>
          ))}
          {index !== Resources.length - 1 && <hr />}
        </div>
      ))}
    </div>
  );
};

export default Resources;
