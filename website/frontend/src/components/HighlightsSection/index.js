import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import Pagination from './pagination';
import Post from './post';
import { useHighlightsData } from '../../../reduxStore/Highlights/selectors';
import { loadHighlightsData, loadTagsData } from '../../../reduxStore/Highlights/operations';
import ImageLoader from '../LoadSpinner/ImageLoader';

const HighlightsSection = () => {
    const dispatch = useDispatch();
    const highlightsData = useHighlightsData();

    useEffect(() => {
        dispatch(loadTagsData());
        dispatch(loadHighlightsData());
    }, [highlightsData.length]);

    const firstPost = highlightsData.length - 1;
    const lastPost = highlightsData.length - 4;
    const highlights = highlightsData.slice(lastPost, firstPost);

    const [startNumber, setStartNumber] = useState(1);
    const totalPosts = highlights.length;

    const paginateRight = (postNumber) => {
        postNumber < totalPosts ? setStartNumber(postNumber + 1) : setStartNumber(postNumber);
    };
    const paginateLeft = (postNumber) => {
        postNumber > 1 && postNumber <= totalPosts ? setStartNumber(postNumber - 1) : setStartNumber(postNumber);
    };

    const onRightClick = () => {
        paginateRight(startNumber);
        const slider = document.getElementById('content');
        const width = slider.clientWidth;
        startNumber <= 1
            ? (slider.style.transform = `translateX(${-0.96 * width}px)`)
            : (slider.style.transform = `translateX(${-1.84 * width}px)`);
    };

    const onLeftClick = () => {
        paginateLeft(startNumber);
        const slider = document.getElementById('content');
        startNumber > 2
            ? (slider.style.transform = `translateX(${-1018}px)`)
            : (slider.style.transform = `translateX(${0}px)`);
    };

    return (
        <div className="highlights-section">
            <div className="highlights-container">
                <div className="content" id="content">
                    {highlightsData.length >= 4 ? (
                        highlights
                            .reverse()
                            .map((highlight) => (
                                <Post
                                    key={highlight.id}
                                    postImg={highlight.image}
                                    Tags={highlight.tags}
                                    title={highlight.title}
                                    article_title="Read article"
                                    article_link={highlight.link}
                                />
                            ))
                    ) : (
                        <div className="_blank">
                            <ImageLoader />
                            <span>Checking for latest Highlights at AirQo</span>
                        </div>
                    )}
                </div>
                {highlightsData.length >= 4 && (
                    <div className="pagination">
                        <Pagination
                            totalPosts={totalPosts}
                            number={startNumber}
                            rightTransition={onRightClick}
                            leftTransition={onLeftClick}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default HighlightsSection;
