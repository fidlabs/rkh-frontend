import { env } from '@/config/environment';
import { SignatureType } from '@/types/governance-review';
import { governanceReview } from './api';

let originalFetch: typeof fetch;

const mocks = vi.hoisted(() => ({
  fetchMock: vi.fn(),
}));

beforeAll(() => {
  originalFetch = global.fetch;
  global.fetch = mocks.fetchMock.mockResolvedValue(
    Promise.resolve({
      json: () => Promise.resolve({}),
    }),
  );
});

afterAll(() => {
  global.fetch = originalFetch;
});

describe('governanceReview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call the correct URL for applicationgovernance review', async () => {
    const props = {
      signatureType: SignatureType.ApproveGovernanceReview,
      id: '123',
      payload: {},
    };

    await governanceReview(props.signatureType, props.id, props.payload);

    expect(mocks.fetchMock).toHaveBeenCalledWith(
      `${env.apiBaseUrl}/applications/${props.id}/approveGovernanceReview`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(props.payload),
      },
    );
  });

  it('should call the correct URL for refresh governance review', async () => {
    const props = {
      signatureType: SignatureType.RefreshReview,
      id: '123',
      payload: {},
    };

    await governanceReview(props.signatureType, props.id, props.payload);

    expect(mocks.fetchMock).toHaveBeenCalledWith(`${env.apiBaseUrl}/refreshes/${props.id}/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(props.payload),
    });
  });

  it('should call the correct URL for KYC override', async () => {
    const props = {
      signatureType: SignatureType.KycOverride,
      id: '123',
      payload: {},
    };

    await governanceReview(props.signatureType, props.id, props.payload);

    expect(mocks.fetchMock).toHaveBeenCalledWith(
      `${env.apiBaseUrl}/applications/${props.id}/approveKycOverride`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(props.payload),
      },
    );
  });
});
