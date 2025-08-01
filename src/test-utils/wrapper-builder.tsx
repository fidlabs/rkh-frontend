import { ReactNode } from 'react';

type ProviderComponent = React.ComponentType<{ children: ReactNode }>;

interface WrapperBuilderState {
  providers: Array<{
    component: ProviderComponent;
    props?: Record<string, any>;
  }>;
}

export class WrapperBuilder {
  private state: WrapperBuilderState = {
    providers: [],
  };

  with(Provider: ProviderComponent, props?: Record<string, any>): WrapperBuilder {
    this.state.providers.push({ component: Provider, props });
    return this;
  }

  build(): React.ComponentType<{ children: ReactNode }> {
    const { providers } = this.state;

    const Wrapper = ({ children }: { children: ReactNode }) => {
      const wrappedChildren = providers.reduce(
        (acc, { component: Provider, props }) => <Provider {...props}>{acc}</Provider>,
        children,
      );

      return <>{wrappedChildren}</>;
    };

    Wrapper.displayName = 'TestWrapper';

    return Wrapper;
  }

  static create(): WrapperBuilder {
    return new WrapperBuilder();
  }
}
