import React from 'react'

const Post = ({postImg, tag1, tag2, title, article_link, article_title}) => {
    return (
        <div className='feature'>
            <img src={postImg} />
            <div className='feature-content'>
                <div className='feature-pills'>
                    <span>{tag1}</span>
                    <span>{tag2}</span>
                </div>
                <h4>{title}</h4>
                <span className='feature-link'>
                    <a href={article_link} target='_blank'>{article_title} {'-->'}</a>
                </span>
            </div>
        </div>
    )
}

export default Post;