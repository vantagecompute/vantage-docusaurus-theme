import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import MDXComponents from '@theme-original/MDXComponents';

// Global MDX components available to all MDX files
const CustomMDXComponents = {
  // Import all the default components (including headings with anchor links)
  ...MDXComponents,
  // Add our custom components
  Tabs,
  TabItem,
};

export default CustomMDXComponents;