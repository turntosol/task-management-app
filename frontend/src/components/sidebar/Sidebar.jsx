import React, { useState } from 'react';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ChecklistIcon from '@mui/icons-material/Checklist';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate, Link } from 'react-router-dom';

import TagList from '../tag/TagList';
import AddTag from '../tag/AddTag';
import useTags from '../../hooks/useTags';
import useCategories from '../../hooks/useCategories';
import useTasks from '../../hooks/useTasks';
import { useAuth } from '../../context/AuthContext';

import './sidebar.scss';

const CATEGORY_COLORS = {
    personal: "#ABD2FA",
    work: "#7692FF",
    order: "#1B2CC1",
};

// 1. Định nghĩa bảng màu mặc định cho các tag cứng
const TAG_COLORS = {
    important: "#ef4444", // Đỏ
    urgent: "#f59e0b",    // Vàng/Cam
    other: "#3b82f6",     // Xanh dương
};

// 2. Hàm lấy màu (ưu tiên tag cố định, nếu không có lấy màu custom hoặc màu mặc định)
const getTagColor = (tagName, customColor) => {
    if (!tagName) return customColor || "#3b82f6";
    return TAG_COLORS[tagName.toLowerCase()] || customColor || "#3b82f6";
};

// 3. Hàm chuẩn hóa hiển thị tên tag (viết hoa chữ cái đầu)
const getTagLabel = (name) => {
    if (!name) return "";
    return name.charAt(0).toUpperCase() + name.slice(1);
};

const Sidebar = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    const {
        tags,
        loading,
        error,
        handleAddTag,
        handleUpdateTag,
        handleDeleteTag
    } = useTags();

    const {
        categories,
        loading: categoriesLoading,
        error: categoriesError
    } = useCategories();

    const { taskList: todayTasks = [] } = useTasks("today");
    const { taskList: upcomingTasks = [] } = useTasks("upcoming");

    const handleLogOut = async () => {
        try {
            await logout();
        } catch (error) {
            console.error(error);
        }
    };

    const getCategoryLabel = (name) =>
        name.charAt(0).toUpperCase() + name.slice(1);

    const toggleSidebar = () => setIsOpen(!isOpen);
    const closeSidebar = () => setIsOpen(false);

    return (
        <>
            {!isOpen && (
                <button
                    className="mobile-menu-toggle"
                    onClick={toggleSidebar}
                    aria-label="Open Menu"
                >
                    <MenuIcon />
                </button>
            )}

            {/* Overlay */}
            {isOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={closeSidebar}
                ></div>
            )}

            <div className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="top">
                    <div className="menu">
                        <span className="menu-title">Menu</span>

                        <button
                            className="mobile-close-btn"
                            onClick={closeSidebar}
                            aria-label="Close Menu"
                        >
                            <CloseIcon />
                        </button>
                    </div>
                </div>

                <div className="center">
                    <ul>
                        <p className="title">TASKS</p>

                        <Link
                            to="/home"
                            style={{ textDecoration: "none" }}
                            onClick={closeSidebar}
                        >
                            <li>
                                <NavigateNextIcon className="icon" />
                                <span>Upcoming</span>
                                <div className="counter">
                                    {upcomingTasks.length}
                                </div>
                            </li>
                        </Link>

                        <Link
                            to="/day"
                            style={{ textDecoration: "none" }}
                            onClick={closeSidebar}
                        >
                            <li>
                                <ChecklistIcon className="icon" />
                                <span>Today</span>
                                <div className="counter">
                                    {todayTasks.length}
                                </div>
                            </li>
                        </Link>

                        <Link
                            to="/calendar"
                            style={{ textDecoration: "none" }}
                            onClick={closeSidebar}
                        >
                            <li>
                                <CalendarMonthIcon className="icon" />
                                <span>Calendar</span>
                            </li>
                        </Link>

                        <Link
                            to="/sticky"
                            style={{ textDecoration: "none" }}
                            onClick={closeSidebar}
                        >
                            <li>
                                <StickyNote2Icon className="icon" />
                                <span>Sticky Wall</span>
                            </li>
                        </Link>
                    </ul>

                    <ul>
                        <p className="title">CATEGORY</p>

                        {!categoriesLoading &&
                            !categoriesError &&
                            categories.map((category) => (
                                <li
                                    key={category.id}
                                    onClick={() => {
                                        navigate(`/category/${category.name}`);
                                        closeSidebar();
                                    }}
                                >
                                    <div
                                        className="color"
                                        style={{
                                            backgroundColor:
                                                CATEGORY_COLORS[category.name]
                                        }}
                                    />

                                    <span>
                                        {getCategoryLabel(category.name)}
                                    </span>

                                    <div className="counter">
                                        {category.task_count}
                                    </div>
                                </li>
                            ))}
                    </ul>

                    <ul>
                        <p className="title">TAGS</p>

                        <div className="tags-wrapper">
                            {loading && (
                                <p style={{
                                    fontSize: '12px',
                                    color: '#666'
                                }}>
                                    Loading tags...
                                </p>
                            )}

                            {error && (
                                <p style={{
                                    fontSize: '12px',
                                    color: '#ef4444'
                                }}>
                                    Failed to load tags
                                </p>
                            )}

                            {!loading && !error && (
                                <TagList
                                    tags={tags}
                                    getTagColor={getTagColor}
                                    getTagLabel={getTagLabel}
                                    onUpdateTag={handleUpdateTag}
                                    onDeleteTag={handleDeleteTag}
                                />
                            )}

                            <AddTag
                                onAddTag={handleAddTag}
                                existingTags={tags}
                            />
                        </div>
                    </ul>
                </div>

                <div className="bottom">
                    <ul>
                        <li
                            onClick={() => {
                                handleLogOut();
                                closeSidebar();
                            }}
                        >
                            <LogoutIcon className="icon" />
                            <span>Sign out</span>
                        </li>
                    </ul>
                </div>
            </div>
        </>
    );
};

export default Sidebar;