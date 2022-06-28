import React from 'react'

const Pagination = ({postsPerHighlight, totalPosts, paginate}) => {
    const postNumbers = [];

    for (let i = 1; i <= Math.ceil(totalPosts / postsPerHighlight); i++) {
        postNumbers.push(i);
    }

    return (
        <div>
            <nav className='pagination-nav'>
                <ul>
                    {
                        postNumbers.map((number, index) => (
                            <li className='post-number'>
                                <a key={index}
                                    onClick={() => paginate(number)}>
                                    <span>{'0'}{number}</span>
                                    <span>{'/'}</span>
                                    <span>{'0'}{postsPerHighlight}</span>
                                </a>
                            </li>
                        ))
                    }
                    {
                        <li id='left'>
                            <a
                                >{'<-'}</a>
                        </li>
                    }
                    {
                        <li id='right'>
                            <a
                                >{'->'}</a>
                        </li>
                    }
                </ul>
            </nav>
        </div>
    )
}

export default Pagination;