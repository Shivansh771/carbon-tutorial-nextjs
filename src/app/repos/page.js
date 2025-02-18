'use client';

import RepoTable from './RepoTable';
import {
  Column,
  Grid,
  Link,
  DataTableSkeleton,
  Pagination,
} from '@carbon/react';
import React, { useEffect, useState } from 'react';
import { Octokit } from '@octokit/core';

const octoKitClient = new Octokit({});

// Define table headers once
const headers = [
  {
    key: 'name',
    header: 'Name',
  },
  {
    key: 'createdAt',
    header: 'Created',
  },
  {
    key: 'updatedAt',
    header: 'Updated',
  },
  {
    key: 'issueCount',
    header: 'Open Issues',
  },
  {
    key: 'stars',
    header: 'Stars',
  },
  {
    key: 'links',
    header: 'Links',
  },
];

function RepoPage() {
  const [firstRowIndex, setFirstRowIndex] = useState(0);
  const [currentPageSize, setCurrentPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    async function getCarbonRepos() {
      try {
        const res = await octoKitClient.request('GET /orgs/{org}/repos', {
          org: 'carbon-design-system',
          per_page: 75,
          sort: 'updated',
          direction: 'desc',
        });

        if (res.status === 200) {
          setRows(getRowItems(res.data));
        } else {
          setError('Error obtaining repository data');
        }
        setLoading(false);
      } catch (error) {
        console.error('Request failed', error);
      }
    }

    getCarbonRepos();
  }, []);
  if (loading) {
    return (
      <Grid className="repo-page">
        <Column lg={16} md={8} sm={4} className="repo-page__r1">
          <DataTableSkeleton
            columnCount={headers.length + 1}
            rowCount={10}
            headers={headers}
          />
        </Column>
      </Grid>
    );
  }
  if (error) {
    return `Error! ${error}`;
  }

  return (
    <Grid className="repo-page">
      <Column lg={16} md={8} sm={4} className="repo-page__r1">
        <RepoTable
          headers={headers}
          rows={rows.slice(firstRowIndex, firstRowIndex + currentPageSize)}
        />
        <Pagination
          totalItems={rows.length}
          backwardText="Previous Page"
          forwardText="Next page"
          pageSize={currentPageSize}
          // Use pageSizes here:
          pageSizes={[5, 10, 15, 25]}
          itemsPerPageText="Items per page"
          onChange={({ page, pageSize }) => {
            if (pageSize !== currentPageSize) {
              // Use the `pageSize` parameter
              setCurrentPageSize(pageSize);
            }
            setFirstRowIndex(pageSize * (page - 1));
          }}
        />
      </Column>
    </Grid>
  );

  // Convert GitHub repo data into rows for your
}

const LinkList = ({ url, homePageUrl }) => (
  <ul style={{ display: 'flex' }}>
    <li>
      <Link href="{url}">Github</Link>
    </li>
    {homePageUrl && (
      <li>
        <span>&nbsp;| &nbsp;</span>
        <Link href={homePageUrl}>Homepage</Link>
      </li>
    )}
  </ul>
);

const getRowItems = (rows) =>
  rows.map((row) => ({
    ...row,
    key: row.id,
    stars: row.stargazers_count,
    issueCount: row.open_issue_count,
    createdAt: new Date(row.created_at).toLocaleDateString(),
    updatedAt: new Date(row.updated_at).toLocaleDateString(),
    links: <LinkList url={row.html_url} homePageUrl={row.homepage} />,
  }));

export default RepoPage;
