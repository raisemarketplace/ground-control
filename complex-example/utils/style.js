// Recommend using cssmodules, but this is fine for demo...

import { merge } from 'lodash';

export const routeStyle = {
  padding: 20,
  border: '1px solid #31c1c9',
};

export const navStyle = merge({}, routeStyle, {
  borderColor: '#b0babf',
  backgroundColor: '#f4f6f6',
  marginBottom: 20,
  paddingBottom: 10,
});

export const linkStyle = {
  display: 'block',
  color: '#31c1c9',
  marginBottom: '10px',
  textDecoration: 'none',
};

export const activeLinkStyle = {
  fontWeight: 'bold',
};

export const booksSectionStyle = {
  padding: 20,
  border: '1px solid #b0babf',
};

export const previewTemplateStyle = {
  width: 300,
  height: 15,
  background: '#f4f6f6',
  marginBottom: 3,
};
