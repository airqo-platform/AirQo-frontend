import React from 'react';
import SidebarHeader from './SidebarHeader';
import SearchField from '@/components/search/SearchField';
import Toast from '@/components/Toast';
import LocationCards from './LocationCards';
import SearchResultsSkeleton from './SearchResultsSkeleton';
import NoResults from './NoResults';
import SectionDivider from './SectionDivider';

const SearchView = React.memo(
  ({
    searchResults,
    loading,
    error,
    clearError,
    onExit,
    onSearch,
    onSelect,
    isAdmin,
  }) => (
    <div className="flex flex-col w-full">
      <div className="flex flex-col gap-3">
        <SidebarHeader isAdmin={isAdmin} isFocused handleHeaderClick={onExit} />
        <div className="px-3">
          <SearchField
            onSearch={onSearch}
            onClearSearch={onExit}
            focus
            showSearchResultsNumber
          />
        </div>
      </div>

      {searchResults.searchTerm === '' ? (
        <SectionDivider />
      ) : (
        <div className="border-t mt-2" />
      )}

      {searchResults.searchTerm === '' ? (
        <div className="px-3 pt-3">
          <NoResults hasSearched={false} />
        </div>
      ) : error.isError ? (
        <Toast
          message={error.message}
          clearData={clearError}
          type={error.type}
          timeout={3000}
          size="lg"
          position="bottom"
        />
      ) : loading && !searchResults.length ? (
        <div className="px-3 pt-3">
          <SearchResultsSkeleton />
        </div>
      ) : searchResults.length === 0 && !loading ? (
        <div className="px-3 pt-3">
          <NoResults hasSearched />
        </div>
      ) : (
        <LocationCards
          searchResults={searchResults}
          isLoading={loading}
          handleLocationSelect={onSelect}
        />
      )}
    </div>
  ),
);

SearchView.displayName = 'SearchView';
export default SearchView;
