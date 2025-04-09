import React, {useMemo} from "react";
import {useLocation, NavLink} from "react-router";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

const DynamicBreadcrumb = () => {
  const location = useLocation();

  const breadcrumbItems = useMemo(() => {
    const pathSegments = location.pathname.split("/").filter(segment => segment !== "");
    if (pathSegments.length === 0) {
      return [{
        name: "Library",
        path: "/",
        isActive: true
      }];
    }
    const items = [];

    let currentPath = "";
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;

      const displayName = segment
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      items.push({
        name: displayName,
        path: currentPath,
        isActive: index === pathSegments.length - 1
      });
    });

    return items;
  }, [location.pathname]);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={item.path}>
            <BreadcrumbItem>
              {item.isActive ? (
                <BreadcrumbPage className={"text-muted-foreground transition-colors duration-100 ease-in-out hover:text-foreground"}>{item.name}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink>
                  <NavLink to={item.path} className={"text-muted-foreground transition-colors duration-100 ease-in-out hover:text-foreground"}>{item.name}</NavLink>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>

            {index < breadcrumbItems.length - 1 && <BreadcrumbSeparator/>}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export {DynamicBreadcrumb};