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

  filters.forEach((filter) => params.append("status[]", filter));

  if (searchTerm) {
    params.append("search", searchTerm);
  }

  const url = `${API_BASE_URL}/applications?${params.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    return {
      applications: result.data.results
        .map((allocator: any) => {
          try {
            const instructionsLength = allocator?.applicationInstructions?.length;
            const datacap = instructionsLength ? allocator?.applicationInstructions[instructionsLength - 1].amount : 5;

            return {
              id: allocator.id,
              number: allocator.number,
              name: allocator.name,
              organization: allocator.organization,
              address: allocator.address,
              github: allocator.github,
              country: allocator.location?.[0] || "Unknown",
              region: allocator.location?.[1] || "Unknown",
              type: allocator.type,
              datacap: datacap,
              createdAt: allocator.createdAt || "2021-09-01T00:00:00.000Z",
              status: allocator.status,
              actorId: allocator.actorId,
              githubPrLink: allocator.applicationDetails?.pullRequestUrl,
              githubPrNumber: allocator.applicationDetails?.pullRequestNumber,
              rkhApprovals: allocator.rkhPhase?.approvals,
              rkhApprovalsThreshold: allocator.rkhPhase?.approvalsThreshold,
              rkhMessageId: allocator.rkhPhase?.messageId,
              allocationInstruction: allocator.allocationInstruction,
            };
          } catch (error) {
            console.error("Error processing application:", error);
            return null;
          }
        })
        .filter((application: any): application is NonNullable<typeof application> => application !== null),
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

export async function approveKYC(id: string) {
  const url = `${API_BASE_URL}/applications/${id}/approveKYC`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id })
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

  } catch (error) {
    console.error("Failed to approve KYC:", error);
    throw new Error("Failed to approve KYC");
  }
}
