import * as React from 'react';
import { connect, MapStateToProps } from 'react-redux';

import * as logo from '../assets/logo.png';
import { RootState } from '../states';
import { Omit } from '../typeutil';

interface StateProps {
  logoPath?: string;
}

type ImgProps = React.DetailedHTMLProps<
  React.ImgHTMLAttributes<HTMLImageElement>,
  HTMLImageElement
>;

type Props = StateProps & Omit<ImgProps, 'src'>;

function AppLogoImpl({ logoPath, ...restProps }: Props) {
  const src = logoPath ? logoPath : logo;
  return <img {...restProps} src={src} />;
}

const mapStateToProps: MapStateToProps<StateProps, {}> = (state: RootState) => {
  return {
    logoPath: state.appConfig.style.logoPath,
  };
};

export const AppLogo = connect(mapStateToProps)(AppLogoImpl);
