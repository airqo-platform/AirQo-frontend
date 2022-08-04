import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux';
import { loadTagsData } from '../../../reduxStore/Highlights/operations';
import { useTagsData } from '../../../reduxStore/Highlights/selectors';

const Post = ({ postImg, Tags, title, article_link, article_title, key }) => {
    const dispatch = useDispatch();
    const tags = useTagsData();

    useEffect(() => {
        dispatch(loadTagsData);
    }, []);
    return (
        <div className='feature' key={key}>
            <div className='img-sm'><img src={postImg} /></div>
            <div className='feature-content'>
                <div className='feature-pills'>
                    {
                        Tags.length > 0 ? Tags.map((Tag) => (
                            <span key={Tag.id}>
                                {
                                    tags.filter((tag) => { tag.id === Tag.id && tag.name })
                                }
                            </span>
                        )) :
                            <div />
                    }
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