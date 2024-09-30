import { env, testApplications } from "@/config/environment";
import { AccountRole } from "@/types/account";
import { ApplicationsResponse } from "@/types/application";

/**
 * API base URL for fetching applications.
 */
const API_BASE_URL = env.apiBaseUrl;

/**
 * Fetches applications based on search criteria and pagination.
 *
 * @param {string} searchTerm - The search term to filter applications
 * @param {string[]} filters - Array of phase filters to apply
 * @param {number} page - The page number for pagination
 * @param {number} pageLimit - The number of items per page
 * @returns {Promise<ApplicationsResponse>} A promise that resolves to the applications response
 * @throws {Error} If the fetch request fails
 */
export async function fetchApplications(
  searchTerm: string,
  filters: string[],
  page: number,
  pageLimit: number
): Promise<ApplicationsResponse> {
  if (env.useTestData) {
    return {
      applications: testApplications,
      totalCount: testApplications.length,
    };
  }

  const params = new URLSearchParams({
    page: page.toString(),
    limit: pageLimit.toString(),
  });

  filters.forEach((filter) => params.append("phase[]", filter));

  if (searchTerm) {
    params.append("search", searchTerm);
  }

  const url = `${API_BASE_URL}/allocators?${params.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    return {
      applications: result.data.allocators.map((allocator: any) => ({
        id: allocator.id,
        number: allocator.number,
        name: allocator.name,
        organization: allocator.organization,
        address: allocator.address,
        github: allocator.github,
        country: allocator.country,
        region: allocator.region,
        type: allocator.type,
        datacap: allocator.datacap,
        createdAt: allocator.createdAt || "2021-09-01T00:00:00.000Z",
        phases: allocator.phases,
        status: {
          phase: allocator.status.phase,
          phaseStatus: allocator.status.phaseStatus,
        },
      })),
      totalCount: result.data.pagination.totalItems,
    };
  } catch (error) {
    console.error("Failed to fetch applications:", error);
    throw new Error("Failed to fetch applications");
  }
}

export async function fetchRole(address: string): Promise<AccountRole> {
  if (env.useTestData) {
    return AccountRole.ADMIN;
  }

  const url = `${API_BASE_URL}/roles?address=${address}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    return result.data.role;
  } catch (error) {
    console.error("Failed to fetch role:", error);
    throw new Error("Failed to fetch role");
  }
}
